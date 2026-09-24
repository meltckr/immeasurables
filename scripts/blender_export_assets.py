import bpy
import math
import os

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def setup_camera():
    bpy.ops.object.camera_add(location=(0, -5, 0), rotation=(math.radians(90), 0, 0))
    bpy.context.scene.camera = bpy.context.object
    bpy.context.scene.render.resolution_x = 1024
    bpy.context.scene.render.resolution_y = 1024
    bpy.context.scene.render.film_transparent = True
    # Default to Eevee
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    
    # Enable bloom if available (Eevee legacy)
    if hasattr(bpy.context.scene, "eevee") and hasattr(bpy.context.scene.eevee, "use_bloom"):
        bpy.context.scene.eevee.use_bloom = True
        bpy.context.scene.eevee.bloom_intensity = 0.8
        bpy.context.scene.eevee.bloom_radius = 6.5

def render_image(filepath):
    bpy.context.scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)

def create_orb(color, name):
    clear_scene()
    setup_camera()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.5, location=(0,0,0))
    obj = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    
    mat = bpy.data.materials.new(name="OrbMat")
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = color
    emission.inputs['Strength'].default_value = 2.0
    
    layer_weight = nodes.new('ShaderNodeLayerWeight')
    math_node = nodes.new('ShaderNodeMath')
    math_node.operation = 'MULTIPLY'
    
    mix = nodes.new('ShaderNodeMixShader')
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    
    links = mat.node_tree.links
    links.new(layer_weight.outputs['Facing'], math_node.inputs[0])
    links.new(math_node.outputs[0], mix.inputs['Fac'])
    links.new(transparent.outputs['BSDF'], mix.inputs[1])
    links.new(emission.outputs['Emission'], mix.inputs[2])
    
    links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    obj.data.materials.append(mat)
    
def create_wash(color, name, filepath):
    clear_scene()
    setup_camera()
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 1280
    
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0,0,0), rotation=(math.radians(90), 0, 0))
    obj = bpy.context.active_object
    
    mat = bpy.data.materials.new(name="WashMat")
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = color
    emission.inputs['Strength'].default_value = 0.5
    
    tex_noise = nodes.new('ShaderNodeTexNoise')
    tex_noise.inputs['Scale'].default_value = 2.0
    
    color_ramp = nodes.new('ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.4
    color_ramp.color_ramp.elements[0].color = (0,0,0,0)
    color_ramp.color_ramp.elements[1].position = 1.0
    color_ramp.color_ramp.elements[1].color = (1,1,1,1)
    
    mix = nodes.new('ShaderNodeMixShader')
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    
    links = mat.node_tree.links
    links.new(tex_noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], mix.inputs['Fac'])
    links.new(transparent.outputs['BSDF'], mix.inputs[1])
    links.new(emission.outputs['Emission'], mix.inputs[2])
    links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    obj.data.materials.append(mat)
    render_image(filepath)

def generate_assets():
    out_dir = os.path.abspath('assets/blender')
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. lotus-soft
    create_orb((1.0, 0.8, 0.9, 1.0), "Lotus") 
    render_image(os.path.join(out_dir, 'lotus-soft.png'))
    
    # 2. orb-light
    create_orb((1.0, 0.95, 0.8, 1.0), "Orb")
    render_image(os.path.join(out_dir, 'orb-light.png'))
    
    # 3. gold-dust
    clear_scene()
    setup_camera()
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0,0,0), rotation=(math.radians(90), 0, 0))
    obj = bpy.context.active_object
    mat = bpy.data.materials.new(name="DustMat")
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = (1.0, 0.8, 0.2, 1.0)
    emission.inputs['Strength'].default_value = 5.0
    
    tex_noise = nodes.new('ShaderNodeTexNoise')
    tex_noise.inputs['Scale'].default_value = 50.0
    
    color_ramp = nodes.new('ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.6
    color_ramp.color_ramp.elements[0].color = (0,0,0,0)
    color_ramp.color_ramp.elements[1].position = 0.62
    color_ramp.color_ramp.elements[1].color = (1,1,1,1)
    
    mix = nodes.new('ShaderNodeMixShader')
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    
    links = mat.node_tree.links
    links.new(tex_noise.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], mix.inputs['Fac'])
    links.new(transparent.outputs['BSDF'], mix.inputs[1])
    links.new(emission.outputs['Emission'], mix.inputs[2])
    links.new(mix.outputs['Shader'], output.inputs['Surface'])
    obj.data.materials.append(mat)
    render_image(os.path.join(out_dir, 'gold-dust.png'))
    
    # Washes
    create_wash((1.0, 0.4, 0.2, 1.0), "WashSaffron", os.path.join(out_dir, 'wash-saffron.png'))
    create_wash((0.1, 0.6, 0.7, 1.0), "WashTeal", os.path.join(out_dir, 'wash-teal.png'))
    create_wash((0.2, 0.7, 0.4, 1.0), "WashJade", os.path.join(out_dir, 'wash-jade.png'))
    create_wash((0.2, 0.3, 0.8, 1.0), "WashIndigo", os.path.join(out_dir, 'wash-indigo.png'))
    
    # Bloom gold thread
    clear_scene()
    setup_camera()
    bpy.ops.mesh.primitive_torus_add(major_radius=2, minor_radius=0.02, location=(0,0,0), rotation=(math.radians(90),0,0))
    obj = bpy.context.active_object
    mat = bpy.data.materials.new(name="ThreadMat")
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new('ShaderNodeOutputMaterial')
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = (1.0, 0.7, 0.1, 1.0)
    emission.inputs['Strength'].default_value = 8.0
    
    mix = nodes.new('ShaderNodeMixShader')
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    
    links = mat.node_tree.links
    links.new(transparent.outputs['BSDF'], mix.inputs[1])
    links.new(emission.outputs['Emission'], mix.inputs[2])
    # Use constant mix factor
    mix.inputs['Fac'].default_value = 1.0 
    
    links.new(mix.outputs['Shader'], output.inputs['Surface'])
    obj.data.materials.append(mat)
    render_image(os.path.join(out_dir, 'bloom-gold-thread.png'))

if __name__ == "__main__":
    generate_assets()
