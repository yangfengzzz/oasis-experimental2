import {
    BlinnPhongMaterial,
    Camera,
    Engine,
    MeshRenderer,
    MeshTopology,
    ModelMesh,
    PrimitiveMesh, Vector2,
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

function createCircleWireFrame(radius: number, vertexBegin: number, vertexCount: number,
                               axis: number, shift: Vector3, positions: Vector3[], indices: Uint16Array) {
    const countReciprocal = 1.0 / vertexCount;
    for (let i = 0; i < vertexCount; ++i) {
        const v = i * countReciprocal;
        const thetaDelta = v * Math.PI * 2;

        const globalIndex = i + vertexBegin;
        switch (axis) {
            case 0:
                positions[globalIndex] = new Vector3(shift.x, radius * Math.cos(thetaDelta) + shift.y, radius * Math.sin(thetaDelta) + shift.z);
                break;
            case 1:
                positions[globalIndex] = new Vector3(radius * Math.cos(thetaDelta) + shift.x, shift.y, radius * Math.sin(thetaDelta) + shift.z);
                break;
            case 2:
                positions[globalIndex] = new Vector3(radius * Math.cos(thetaDelta) + shift.x, radius * Math.sin(thetaDelta) + shift.y, shift.z);
                break;
        }

        if (i < vertexCount - 1) {
            indices[2 * globalIndex] = globalIndex;
            indices[2 * globalIndex + 1] = globalIndex + 1;
        } else {
            indices[2 * globalIndex] = globalIndex;
            indices[2 * globalIndex + 1] = vertexBegin;
        }
    }
}

export function createSphereWireFrame(engine: Engine,
                                      radius: number = 0.5): ModelMesh {
    const mesh = new ModelMesh(engine);

    const vertexCount = 40;
    const shift = new Vector3();

    const positions: Vector3[] = new Array(vertexCount * 3);
    const indices = new Uint16Array(vertexCount * 6);
    // X
    createCircleWireFrame(radius, 0, vertexCount, 0, shift, positions, indices);

    // Y
    createCircleWireFrame(radius, vertexCount, vertexCount, 1, shift, positions, indices);

    // Z
    createCircleWireFrame(radius, 2 * vertexCount, vertexCount, 2, shift, positions, indices);

    mesh.setPositions(positions);
    mesh.setIndices(indices);

    mesh.uploadData(true);
    mesh.addSubMesh(0, indices.length, MeshTopology.Lines);
    return mesh;
}

function createEllipticWireFrame(radius: number, height: number, vertexBegin: number, vertexCount: number,
                                 axis: number, positions: Vector3[], indices: Uint16Array) {
    const countReciprocal = 1.0 / vertexCount;
    for (let i = 0; i < vertexCount; ++i) {
        const v = i * countReciprocal;
        const thetaDelta = v * Math.PI * 2;

        const globalIndex = i + vertexBegin;
        switch (axis) {
            case 0:
                positions[globalIndex] = new Vector3(0, radius * Math.sin(thetaDelta) + height, radius * Math.cos(thetaDelta));
                break;
            case 1:
                positions[globalIndex] = new Vector3(radius * Math.cos(thetaDelta), height, radius * Math.sin(thetaDelta));
                break;
            case 2:
                positions[globalIndex] = new Vector3(radius * Math.cos(thetaDelta), radius * Math.sin(thetaDelta) + height, 0);
                break;
        }

        if (i == vertexCount / 2) {
            height = -height;
        }

        if (i < vertexCount - 1) {
            indices[2 * globalIndex] = globalIndex;
            indices[2 * globalIndex + 1] = globalIndex + 1;
        } else {
            indices[2 * globalIndex] = globalIndex;
            indices[2 * globalIndex + 1] = vertexBegin;
        }
    }
}

export function createCapsuleWireFrame(engine: Engine,
                                       radius: number = 0.5,
                                       height: number = 2,): ModelMesh {
    const mesh = new ModelMesh(engine);

    const vertexCount = 40;
    const shift = new Vector3();
    const halfHeight = height / 2;
    const positions: Vector3[] = new Array(vertexCount * 4);
    const indices = new Uint16Array(vertexCount * 8);

    // Y-Top
    shift.y = halfHeight;
    createCircleWireFrame(radius, 0, vertexCount, 1, shift, positions, indices);

    // Y-Bottom
    shift.y = -halfHeight;
    createCircleWireFrame(radius, vertexCount, vertexCount, 1, shift, positions, indices);

    // X-Elliptic
    createEllipticWireFrame(radius, halfHeight, vertexCount * 2, vertexCount, 2, positions, indices);

    // Z-Elliptic
    createEllipticWireFrame(radius, halfHeight, vertexCount * 3, vertexCount, 0, positions, indices);

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

    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = 0.0;
    color.g = 0.8;
    color.b = 0.5;
    color.a = 1.0;

    // init cube
    const cubeEntity = rootEntity.createChild("cube");
    cubeEntity.transform.setPosition(4, 0, 0);
    const cubeRenderer = cubeEntity.addComponent(MeshRenderer);
    cubeRenderer.mesh = PrimitiveMesh.createCuboid(engine);
    cubeRenderer.setMaterial(mtl);

    //init cube collider
    const cubeColliderEntity = cubeEntity.createChild("cubeCollider");
    const cubeColliderRenderer = cubeColliderEntity.addComponent(MeshRenderer);
    cubeColliderRenderer.mesh = createCuboidWireFrame(engine, 2, 2, 2);
    cubeColliderRenderer.setMaterial(mtl);

    // init sphere
    const sphereEntity = rootEntity.createChild("sphere");
    const sphereRenderer = sphereEntity.addComponent(MeshRenderer);
    sphereRenderer.mesh = PrimitiveMesh.createSphere(engine);
    sphereRenderer.setMaterial(mtl);

    //init cube collider
    const sphereColliderEntity = sphereEntity.createChild("sphereCollider");
    const sphereColliderRenderer = sphereColliderEntity.addComponent(MeshRenderer);
    sphereColliderRenderer.mesh = createSphereWireFrame(engine, 1);
    sphereColliderRenderer.setMaterial(mtl);

    // init capsule
    const capsuleEntity = rootEntity.createChild("capsule");
    capsuleEntity.transform.setPosition(-4, 0, 0);
    const capsuleRenderer = capsuleEntity.addComponent(MeshRenderer);
    capsuleRenderer.mesh = createCapsule(engine, 1, 3, 10);
    capsuleRenderer.setMaterial(mtl);

    const capsuleColliderEntity = capsuleEntity.createChild("capsuleCollider");
    const capsuleColliderRenderer = capsuleColliderEntity.addComponent(MeshRenderer);
    capsuleColliderRenderer.mesh = createCapsuleWireFrame(engine, 2, 4);
    capsuleColliderRenderer.setMaterial(mtl);

    engine.run();
}

//----------------------------------------------------------------------------------------------------------------------
/**
 * Create a capsule mesh.
 * @param engine - Engine
 * @param radius - The radius of cap
 * @param height - The height of capsule
 * @param radialSegments - Cap radial segments
 * @param heightSegments - Capsule height segments
 * @param noLongerAccessible - No longer access the vertices of the mesh after creation
 * @returns Capsule model mesh
 */
function createCapsule(
    engine: Engine,
    radius: number = 0.5,
    height: number = 2,
    radialSegments: number = 6,
    heightSegments: number = 1,
    noLongerAccessible: boolean = true
): ModelMesh {
    const mesh = new ModelMesh(engine);

    radialSegments = Math.max(2, Math.floor(radialSegments));
    heightSegments = Math.floor(heightSegments);

    const radialCount = radialSegments + 1;
    const verticalCount = heightSegments + 1;
    const halfHeight = height * 0.5;
    const unitHeight = height / heightSegments;
    const torsoVertexCount = radialCount * verticalCount;
    const torsoRectangleCount = radialSegments * heightSegments;

    const capVertexCount = radialCount * radialCount;
    const capRectangleCount = radialSegments * radialSegments;

    const totalVertexCount = torsoVertexCount + 2 * capVertexCount;
    const totalRectangleCount = torsoRectangleCount + 2 * capRectangleCount;

    const torsoThetaStart = Math.PI / 2;
    const torsoThetaRange = Math.PI * 2;

    const capTopAlphaRange = Math.PI * 2;
    const capBottomAlphaRange = -Math.PI * 2;
    const capThetaRange = Math.PI / 2;

    const radialCountReciprocal = 1.0 / radialCount;
    const radialSegmentsReciprocal = 1.0 / radialSegments;
    const heightSegmentsReciprocal = 1.0 / heightSegments;
    const indices = _generateIndices(engine, totalVertexCount, totalRectangleCount * 6);

    const positions: Vector3[] = new Array(totalVertexCount);
    const normals: Vector3[] = new Array(totalVertexCount);
    const uvs: Vector2[] = new Array(totalVertexCount);

    let indicesOffset = 0;

    // create torso
    for (let i = 0; i < torsoVertexCount; ++i) {
        const x = i % radialCount;
        const y = (i * radialCountReciprocal) | 0;
        const u = x * radialSegmentsReciprocal;
        const v = y * heightSegmentsReciprocal;
        const theta = torsoThetaStart + u * torsoThetaRange;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        let posX = radius * sinTheta;
        let posY = y * unitHeight - halfHeight;
        let posZ = radius * cosTheta;

        // Position
        positions[i] = new Vector3(posX, posY, posZ);
        // Normal
        normals[i] = new Vector3(sinTheta, 0, cosTheta);
        // Texcoord
        uvs[i] = new Vector2(u, 1 - v);
    }

    for (let i = 0; i < torsoRectangleCount; ++i) {
        const x = i % radialSegments;
        const y = (i * radialSegmentsReciprocal) | 0;

        const a = y * radialCount + x;
        const b = a + 1;
        const c = a + radialCount;
        const d = c + 1;

        indices[indicesOffset++] = b;
        indices[indicesOffset++] = c;
        indices[indicesOffset++] = a;
        indices[indicesOffset++] = b;
        indices[indicesOffset++] = d;
        indices[indicesOffset++] = c;
    }

    // create cap
    const createCap = function (capAlphaRange: number, offset: number, posIndex: number) {
        for (let i = 0; i < capVertexCount; ++i) {
            const x = i % radialCount;
            const y = (i * radialCountReciprocal) | 0;
            const u = x * radialSegmentsReciprocal;
            const v = y * radialSegmentsReciprocal;
            const alphaDelta = u * capAlphaRange;
            const thetaDelta = v * capThetaRange;
            const sinTheta = Math.sin(thetaDelta);

            let posX = -radius * Math.cos(alphaDelta) * sinTheta;
            let posY = (radius * Math.cos(thetaDelta) + halfHeight) * posIndex;
            let posZ = radius * Math.sin(alphaDelta) * sinTheta;

            // Position
            positions[i + offset] = new Vector3(posX, posY, posZ);
            // Normal
            normals[i + offset] = new Vector3(posX, posY, posZ);
            // Texcoord
            uvs[i + offset] = new Vector2(u, v);
        }

        for (let i = 0; i < capRectangleCount; ++i) {
            const x = i % radialSegments;
            const y = (i * radialSegmentsReciprocal) | 0;

            const a = y * radialCount + x + offset;
            const b = a + 1;
            const c = a + radialCount;
            const d = c + 1;

            indices[indicesOffset++] = b;
            indices[indicesOffset++] = a;
            indices[indicesOffset++] = d;
            indices[indicesOffset++] = a;
            indices[indicesOffset++] = c;
            indices[indicesOffset++] = d;
        }
    };

    createCap(capTopAlphaRange, torsoVertexCount, 1);
    createCap(capBottomAlphaRange, torsoVertexCount + capVertexCount, -1);

    const {bounds} = mesh;
    bounds.min.setValue(-radius, -radius - halfHeight, -radius);
    bounds.max.setValue(radius, radius + halfHeight, radius);

    _initialize(mesh, positions, normals, uvs, indices, noLongerAccessible);
    return mesh;
}

function _initialize(
    mesh: ModelMesh,
    positions: Vector3[],
    normals: Vector3[],
    uvs: Vector2[],
    indices: Uint16Array | Uint32Array,
    noLongerAccessible: boolean
) {
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUVs(uvs);
    mesh.setIndices(indices);

    mesh.uploadData(noLongerAccessible);
    mesh.addSubMesh(0, indices.length);
}

function _generateIndices(engine: Engine, vertexCount: number, indexCount: number): Uint16Array | Uint32Array {
    return new Uint16Array(indexCount);
}