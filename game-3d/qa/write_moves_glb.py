"""Write authored clips to game-3d/build/assets/anim_moves.glb"""
import sys
sys.path.insert(0, '/home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/qa')
from author_clips import CLIPS, BONES, REPO
from pygltflib import GLTF2, Animation, AnimationChannel, AnimationChannelTarget, AnimationSampler, Accessor, BufferView, Buffer, Asset
import numpy as np
import struct

# Load template for node structure
tpl = GLTF2.load(f'{REPO}/game-3d/build/assets/anim_melee.glb')

g = GLTF2()
g.asset = Asset(version='2.0', generator='cd-moves-expansion clip author')
# copy nodes (skeleton structure for track binding)
g.nodes = tpl.nodes
g.scenes = tpl.scenes
g.scene = tpl.scene

# Build buffer: for each clip, for each bone: times + quats
buf = bytearray()
animations = []
for clip_name, keys in CLIPS.items():
    anim = Animation(name=clip_name, channels=[], samplers=[])
    times = np.array([k[0] for k in keys], dtype=np.float32)
    for bone in BONES:
        # find node index
        ni = next(i for i, n in enumerate(g.nodes) if n.name == bone)
        quats = np.array([k[1][bone] for k in keys], dtype=np.float32)
        # normalize
        quats = quats / np.linalg.norm(quats, axis=1, keepdims=True)
        # input accessor (times)
        t_off = len(buf)
        buf.extend(times.tobytes())
        # pad to 4
        while len(buf) % 4: buf.append(0)
        q_off = len(buf)
        buf.extend(quats.tobytes())
        while len(buf) % 4: buf.append(0)
        # bufferViews
        bv_t = len(g.bufferViews)
        g.bufferViews.append(BufferView(buffer=0, byteOffset=t_off, byteLength=len(times.tobytes()), target=None))
        bv_q = len(g.bufferViews)
        g.bufferViews.append(BufferView(buffer=0, byteOffset=q_off, byteLength=len(quats.tobytes()), target=None))
        # accessors
        acc_t = len(g.accessors)
        g.accessors.append(Accessor(bufferView=bv_t, byteOffset=0, componentType=5126, count=len(times), type='SCALAR', min=[float(times[0])], max=[float(times[-1])]))
        acc_q = len(g.accessors)
        qmin = quats.min(axis=0).tolist(); qmax = quats.max(axis=0).tolist()
        g.accessors.append(Accessor(bufferView=bv_q, byteOffset=0, componentType=5126, count=len(quats), type='VEC4', min=qmin, max=qmax))
        # sampler + channel
        si = len(anim.samplers)
        anim.samplers.append(AnimationSampler(input=acc_t, output=acc_q, interpolation='LINEAR'))
        anim.channels.append(AnimationChannel(sampler=si, target=AnimationChannelTarget(node=ni, path='rotation')))
    animations.append(anim)

g.animations = animations
g.buffers = [Buffer(byteLength=len(buf))]
g.set_binary_blob(bytes(buf))

out = f'{REPO}/game-3d/build/assets/anim_moves.glb'
g.save(out)
print("wrote", out, "anims:", len(animations))
# verify
g2 = GLTF2.load(out)
print("verify:", [a.name for a in g2.animations])
