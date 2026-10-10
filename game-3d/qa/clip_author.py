"""Clip authoring toolkit: decode existing GLB clips, blend/sample them, write new clips."""
from pygltflib import GLTF2
import meshopt
import numpy as np
import copy

REPO = '/home/hatch/workspace/ConcreteDragon-moves-expansion'

class ClipReader:
    def __init__(self, glb_path):
        self.g = GLTF2.load(glb_path)
        self.blob = self.g.binary_blob()
        self.node_names = [n.name for n in self.g.nodes]
        self._cache = {}
    
    def _decode_acc(self, acc_idx):
        if acc_idx in self._cache: return self._cache[acc_idx]
        acc = self.g.accessors[acc_idx]
        bv = self.g.bufferViews[acc.bufferView]
        ext = bv.extensions['EXT_meshopt_compression']
        src = self.blob[ext['byteOffset']:ext['byteOffset']+ext['byteLength']]
        raw = meshopt.decode_gltf_buffer(src, ext['count'], ext['byteStride'], 'ATTRIBUTES', 'NONE')
        arr = np.frombuffer(raw.tobytes(), dtype=np.float32)
        off = (acc.byteOffset or 0)//4
        n = acc.count
        comp = {'SCALAR':1,'VEC3':3,'VEC4':4}[acc.type]
        vals = arr[off:off+n*comp].reshape(n, comp)
        self._cache[acc_idx] = vals
        return vals
    
    def get_track(self, anim_name, bone, path):
        """Returns (times, values) for a bone's rotation/translation track."""
        for a in self.g.animations:
            if a.name != anim_name: continue
            for c in a.channels:
                if self.g.nodes[c.target.node].name == bone and c.target.path == path:
                    s = a.samplers[c.sampler]
                    times = self._decode_acc(s.input).flatten()
                    vals = self._decode_acc(s.output)
                    return times, vals
        return None, None
    
    def sample_pose(self, anim_name, t):
        """Sample full pose (all bones) at time t. Returns dict bone->quat."""
        pose = {}
        for a in self.g.animations:
            if a.name != anim_name: continue
            for c in a.channels:
                bone = self.g.nodes[c.target.node].name
                if c.target.path != 'rotation': continue
                s = a.samplers[c.sampler]
                times = self._decode_acc(s.input).flatten()
                vals = self._decode_acc(s.output)
                # find bracketing keyframes and slerp
                idx = np.searchsorted(times, t)
                if idx <= 0: q = vals[0]
                elif idx >= len(times): q = vals[-1]
                else:
                    t0, t1 = times[idx-1], times[idx]
                    f = (t - t0)/(t1 - t0) if t1 > t0 else 0
                    q = slerp(vals[idx-1], vals[idx], f)
                pose[bone] = q
            break
        return pose
    
    def anim_duration(self, anim_name):
        for a in self.g.animations:
            if a.name == anim_name:
                for c in a.channels:
                    s = a.samplers[c.sampler]
                    times = self._decode_acc(s.input).flatten()
                    return times[-1]
        return 0

def slerp(q0, q1, t):
    """Spherical linear interpolation between quaternions."""
    dot = np.dot(q0, q1)
    if dot < 0: q1 = -q1; dot = -dot
    if dot > 0.9995:
        return (1-t)*q0 + t*q1
    th0 = np.arccos(np.clip(dot, -1, 1))
    s0 = np.sin(th0)
    return (np.sin((1-t)*th0)/s0)*q0 + (np.sin(t*th0)/s0)*q1

def quat_mult(q1, q2):
    """Multiply quaternions q1*q2."""
    x1,y1,z1,w1 = q1; x2,y2,z2,w2 = q2
    return np.array([
        w1*x2 + x1*w2 + y1*z2 - z1*y2,
        w1*y2 - x1*z2 + y1*w2 + z1*x2,
        w1*z2 + x1*y2 - y1*x2 + z1*w2,
        w1*w2 - x1*x2 - y1*y2 - z1*z2])

def euler_to_quat(rx, ry, rz, degrees=True):
    """Euler XYZ to quaternion."""
    if degrees: rx, ry, rz = np.radians([rx, ry, rz])
    cx, sx = np.cos(rx/2), np.sin(rx/2)
    cy, sy = np.cos(ry/2), np.sin(ry/2)
    cz, sz = np.cos(rz/2), np.sin(rz/2)
    # XYZ order
    return np.array([
        sx*cy*cz + cx*sy*sz,
        cx*sy*cz - sx*cy*sz,
        cx*cy*sz + sx*sy*cz,
        cx*cy*cz - sx*sy*sz])
