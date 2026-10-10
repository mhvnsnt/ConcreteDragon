"""Author new animation clips for Concrete Dragon moves expansion.
Real keyframed clips (not procedural): sampled/blended from existing mocap-style clips + authored offsets.
Writes game-3d/build/assets/anim_moves.glb
"""
import sys, copy
sys.path.insert(0, '/home/hatch/workspace/ConcreteDragon-moves-expansion/game-3d/qa')
from clip_author import ClipReader, slerp, quat_mult, euler_to_quat
from pygltflib import GLTF2, Animation, AnimationChannel, AnimationChannelTarget, AnimationSampler, Accessor, BufferView, Buffer
import numpy as np
import struct

REPO = '/home/hatch/workspace/ConcreteDragon-moves-expansion'
reader = ClipReader(f'{REPO}/game-3d/build/assets/anim_melee.glb')

# Bone list (animated bones only)
BONES = ['hips','spine','chest','head','upperarm.l','lowerarm.l','wrist.l','hand.l',
         'upperarm.r','lowerarm.r','wrist.r','hand.r',
         'upperleg.l','lowerleg.l','foot.l','toes.l',
         'upperleg.r','lowerleg.r','foot.r','toes.r']

def get_pose(clip, t):
    """Full pose dict at time t, filling missing bones with rest."""
    pose = reader.sample_pose(clip, t)
    # rest pose fallback
    g = reader.g
    for b in BONES:
        if b not in pose:
            for n in g.nodes:
                if n.name == b:
                    r = n.rotation or [0,0,0,1]
                    pose[b] = np.array(r, dtype=np.float32)
    return pose

def offset_pose(pose, offsets):
    """Apply Euler offsets (degrees) to a pose. offsets: bone->(rx,ry,rz)."""
    out = dict(pose)
    for bone, (rx, ry, rz) in offsets.items():
        if bone in out:
            dq = euler_to_quat(rx, ry, rz)
            out[bone] = quat_mult(dq, out[bone])
    return out

def blend_pose(p1, p2, f):
    out = {}
    for b in BONES:
        q1 = p1.get(b); q2 = p2.get(b)
        if q1 is None: out[b] = q2
        elif q2 is None: out[b] = q1
        else: out[b] = slerp(q1, q2, f)
    return out

# Reference poses
IDLE = lambda t=0: get_pose('Melee_Unarmed_Idle', t)
PUNCH_EXT = get_pose('Melee_Unarmed_Attack_Punch_A', 0.62)  # full extension
PUNCH_WIND = get_pose('Melee_Unarmed_Attack_Punch_A', 0.25)  # windup
KICK_EXT = get_pose('Melee_Unarmed_Attack_Kick', 0.55)
KICK_WIND = get_pose('Melee_Unarmed_Attack_Kick', 0.25)

# --- Clip definitions: name -> list of (time, pose) ---
CLIPS = {}

# 1. Punch_B (hook): Punch_A with torso twist
p_hook_wind = offset_pose(PUNCH_WIND, {'chest': (0,-25,0), 'hips': (0,-12,0)})
p_hook_hit = offset_pose(PUNCH_EXT, {'chest': (0,30,0), 'hips': (0,15,0), 'head': (0,-15,0)})
CLIPS['Melee_Unarmed_Attack_Punch_B'] = [
    (0.0, IDLE()),
    (0.12, p_hook_wind),
    (0.28, p_hook_hit),
    (0.55, IDLE()),
]

# 2. Kick_A (roundhouse): Kick with hips twist
k_rh_wind = offset_pose(KICK_WIND, {'hips': (0,-20,0), 'chest': (0,-15,0)})
k_rh_hit = offset_pose(KICK_EXT, {'hips': (0,25,0), 'chest': (0,20,0)})
CLIPS['Melee_Unarmed_Attack_Kick_A'] = [
    (0.0, IDLE()),
    (0.14, k_rh_wind),
    (0.32, k_rh_hit),
    (0.60, IDLE()),
]

# 3. KiBlast: snappy palm thrust (fast Punch_A extension + wrist snap)
kb_chamber = offset_pose(get_pose('Melee_Unarmed_Attack_Punch_A', 0.35), {'wrist.r': (0,0,-30)})
kb_thrust = offset_pose(PUNCH_EXT, {'wrist.r': (-40,0,0), 'chest': (5,0,0)})
CLIPS['KiBlast'] = [
    (0.0, IDLE()),
    (0.08, kb_chamber),
    (0.16, kb_thrust),
    (0.35, IDLE()),
]

# 4. WaveCharge: crouch + arms back (loopable)
crouch = offset_pose(IDLE(), {
    'hips': (15,0,0),
    'upperleg.l': (-25,0,0), 'upperleg.r': (-25,0,0),
    'lowerleg.l': (35,0,0), 'lowerleg.r': (35,0,0),
    'upperarm.l': (30,0,-20), 'upperarm.r': (30,0,20),
    'chest': (10,0,0),
})
crouch2 = offset_pose(crouch, {'chest': (13,0,0), 'hips': (17,0,0)})  # tremble variant
CLIPS['WaveCharge'] = [
    (0.0, IDLE()),
    (0.25, crouch),
    (0.45, crouch2),
    (0.65, crouch),
    (0.85, crouch2),
]

# 5. WaveRelease: double palm thrust (both arms do punch extension)
wr = dict(PUNCH_EXT)
# copy right arm pose to left arm
for src, dst in [('upperarm.r','upperarm.l'), ('lowerarm.r','lowerarm.l'), ('wrist.r','wrist.l'), ('hand.r','hand.l')]:
    if src in PUNCH_EXT: wr[dst] = PUNCH_EXT[src]
wr = offset_pose(wr, {'chest': (12,0,0), 'hips': (8,0,0)})
CLIPS['WaveRelease'] = [
    (0.0, crouch),
    (0.12, wr),
    (0.40, IDLE()),
]

# 6. SpinAttack: 360 hips rotation + arms extended
spin_arm = offset_pose(PUNCH_EXT, {})  # arms extended
def spin_pose(angle_deg):
    p = dict(spin_arm)
    # rotate hips by angle around Y (compose with rest)
    q = euler_to_quat(0, angle_deg, 0)
    # get hips rest and compose: spin * rest
    p['hips'] = quat_mult(q, spin_arm['hips'])
    return p
CLIPS['SpinAttack'] = [
    (0.0, IDLE()),
    (0.10, spin_pose(0)),
    (0.20, spin_pose(90)),
    (0.30, spin_pose(180)),
    (0.40, spin_pose(270)),
    (0.50, spin_pose(360)),
    (0.62, IDLE()),
]

# 7. Idle_B: variant (weight shift + breathing)
idle_b1 = offset_pose(get_pose('Melee_Unarmed_Idle', 0.3), {'hips': (0,0,4), 'chest': (0,0,-3)})
idle_b2 = offset_pose(get_pose('Melee_Unarmed_Idle', 0.8), {'hips': (0,0,-4), 'chest': (0,0,3)})
CLIPS['Idle_B'] = [
    (0.0, idle_b1),
    (0.55, idle_b2),
    (1.10, idle_b1),
]

print("Defined", len(CLIPS), "clips")
for name, keys in CLIPS.items():
    print(f"  {name}: {len(keys)} keyframes, {keys[-1][0]:.2f}s")
