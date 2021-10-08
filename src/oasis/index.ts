import {
    BlinnPhongMaterial,
    Camera,
    Engine,
    MeshRenderer,
    MeshTopology,
    ModelMesh,
    PrimitiveMesh,
    Vector3,
    WebGLEngine,
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";

export function createCuboidWireFrame(engine: Engine,
                                      width: number = 1,
                                      height: number = 1,
                                      depth: number = 1): ModelMesh {
    const mesh = new ModelMesh(engine);

    const halfWidth: number = width / 2;
    const halfHeight: number = height / 2;
    const halfDepth: number = depth / 2;

    const positions: Vector3[] = new Array(24);
    // Up
    positions[0] = new Vector3(-halfWidth, halfHeight, -halfDepth);
    positions[1] = new Vector3(halfWidth, halfHeight, -halfDepth);
    positions[2] = new Vector3(halfWidth, halfHeight, halfDepth);
    positions[3] = new Vector3(-halfWidth, halfHeight, halfDepth);

    // Down
    positions[4] = new Vector3(-halfWidth, -halfHeight, -halfDepth);
    positions[5] = new Vector3(halfWidth, -halfHeight, -halfDepth);
    positions[6] = new Vector3(halfWidth, -halfHeight, halfDepth);
    positions[7] = new Vector3(-halfWidth, -halfHeight, halfDepth);

    // Left
    positions[8] = new Vector3(-halfWidth, halfHeight, -halfDepth);
    positions[9] = new Vector3(-halfWidth, halfHeight, halfDepth);
    positions[10] = new Vector3(-halfWidth, -halfHeight, halfDepth);
    positions[11] = new Vector3(-halfWidth, -halfHeight, -halfDepth);

    // Right
    positions[12] = new Vector3(halfWidth, halfHeight, -halfDepth);
    positions[13] = new Vector3(halfWidth, halfHeight, halfDepth);
    positions[14] = new Vector3(halfWidth, -halfHeight, halfDepth);
    positions[15] = new Vector3(halfWidth, -halfHeight, -halfDepth);

    // Front
    positions[16] = new Vector3(-halfWidth, halfHeight, halfDepth);
    positions[17] = new Vector3(halfWidth, halfHeight, halfDepth);
    positions[18] = new Vector3(halfWidth, -halfHeight, halfDepth);
    positions[19] = new Vector3(-halfWidth, -halfHeight, halfDepth);

    // Back
    positions[20] = new Vector3(-halfWidth, halfHeight, -halfDepth);
    positions[21] = new Vector3(halfWidth, halfHeight, -halfDepth);
    positions[22] = new Vector3(halfWidth, -halfHeight, -halfDepth);
    positions[23] = new Vector3(-halfWidth, -halfHeight, -halfDepth);

    const indices = new Uint16Array(48);
    // Up
    indices[0] = 0, indices[1] = 1;
    indices[2] = 1, indices[3] = 2;
    indices[4] = 2, indices[5] = 3;
    indices[6] = 3, indices[7] = 0;
    // Down
    indices[8] = 4, indices[9] = 5;
    indices[10] = 5, indices[11] = 6;
    indices[12] = 6, indices[13] = 7;
    indices[14] = 7, indices[15] = 4;
    // Left
    indices[16] = 8, indices[17] = 9;
    indices[18] = 9, indices[19] = 10;
    indices[20] = 10, indices[21] = 11;
    indices[22] = 11, indices[23] = 8;
    // Right
    indices[24] = 12, indices[25] = 13;
    indices[26] = 13, indices[27] = 14;
    indices[28] = 14, indices[29] = 15;
    indices[30] = 15, indices[31] = 12;
    // Front
    indices[32] = 16, indices[33] = 17;
    indices[34] = 17, indices[35] = 18;
    indices[36] = 18, indices[37] = 19;
    indices[38] = 19, indices[39] = 16;
    // Back
    indices[40] = 20, indices[41] = 21;
    indices[42] = 21, indices[43] = 22;
    indices[44] = 22, indices[45] = 23;
    indices[46] = 23, indices[47] = 20;

    mesh.setPositions(positions);
    mesh.setIndices(indices);

    mesh.uploadData(true);
    mesh.addSubMesh(0, indices.length, MeshTopology.Lines);
    return mesh;
}

export function createOasis() {
    const engine = new WebGLEngine("canvas");
    engine.canvas.resizeByClientSize();
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    const pos = cameraEntity.transform.position;
    pos.setValue(10, 10, 10);
    cameraEntity.transform.position = pos;
    cameraEntity.transform.lookAt(new Vector3(0, 0, 0));
    cameraEntity.addComponent(OrbitControl);

    // init light
    scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);
    scene.ambientLight.diffuseIntensity = 1.2;

    // init cube
    const cubeEntity = rootEntity.createChild("cube");
    const renderer = cubeEntity.addComponent(MeshRenderer);
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = 0.0;
    color.g = 0.8;
    color.b = 0.5;
    color.a = 1.0;
    renderer.mesh = PrimitiveMesh.createCuboid(engine);
    renderer.setMaterial(mtl);

    //init cube collider
    const cubeColliderEntity = cubeEntity.createChild("cubeCollider");
    const colliderRenderer = cubeColliderEntity.addComponent(MeshRenderer);
    colliderRenderer.mesh = createCuboidWireFrame(engine, 2, 2, 2);
    colliderRenderer.setMaterial(mtl);

    engine.run();
}
