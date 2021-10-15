import {
    BlinnPhongMaterial,
    Camera,
    MeshRenderer, ModelMesh,
    PrimitiveMesh, Vector2,
    Vector3,
    WebGLEngine,
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";
import {HeightMap} from "./HeightMap";

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

    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = 0.0;
    color.g = 0.8;
    color.b = 0.5;
    color.a = 1.0;

    // init cube
    const cubeEntity = rootEntity.createChild("cube");
    const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
    const mesh = PrimitiveMesh.createCuboid(engine, 1, 1, 1, false);
    cubeRenderer.mesh = mesh;
    cubeRenderer.setMaterial(mtl);

    const planeRenderer = cubeEntity.addComponent(MeshRenderer);
    const plane = PrimitiveMesh.createCuboid(engine, 2, 0.1, 2, false);
    planeRenderer.mesh = plane;
    planeRenderer.setMaterial(mtl);

    let meshes: ModelMesh[][] = []
    meshes[0] = []
    meshes[0][0] = mesh
    meshes[0].push(plane)

    let outSize = new Vector2()
    const map = HeightMap.creatFromMesh(meshes, 100, 100);

    // example
    const rayPos = new Vector3(1, 1, 1);
    console.assert(map.getHeight(0, 0) == 0.5)
    console.assert(isNaN(map.getHeight(-1, -1)))
    console.assert(map.getHeight(-0.8, -0.8) == 0.050000000000000044)

    engine.run();
}