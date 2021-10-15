import {ModelMesh, Ray, Vector2, Vector3} from "oasis-engine";

export class HeightMap {
    private static _tempRay: Ray = new Ray()
    private static _tempVector30: Vector3 = new Vector3();
    private static _tempVector31: Vector3 = new Vector3();
    private static _tempVector32: Vector3 = new Vector3();
    private static _tempVector33: Vector3 = new Vector3();
    private static _tempVector34: Vector3 = new Vector3();

    /**
     * 计算射线和三角形碰撞并返回碰撞距离。
     * @param    ray 射线。
     * @param    vertex1 顶点1。
     * @param    vertex2 顶点2。
     * @param    vertex3 顶点3。
     * @return   射线距离三角形的距离，返回Number.NaN则不相交。
     */
    public static rayIntersectsTriangle(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number {
        let result: number;
        // Compute vectors along two edges of the triangle.
        const edge1: Vector3 = HeightMap._tempVector30, edge2: Vector3 = HeightMap._tempVector31;

        Vector3.subtract(vertex2, vertex1, edge1);
        Vector3.subtract(vertex3, vertex1, edge2);

        // Compute the determinant.
        const directionCrossEdge2: Vector3 = HeightMap._tempVector32;
        Vector3.cross(ray.direction, edge2, directionCrossEdge2);

        const determinant = Vector3.dot(edge1, directionCrossEdge2);

        // If the ray is parallel to the triangle plane, there is no collision.
        if (determinant > -Number.MIN_VALUE && determinant < Number.MIN_VALUE) {
            result = Number.NaN;
            return result;
        }

        const inverseDeterminant = 1.0 / determinant;

        // Calculate the U parameter of the intersection point.
        const distanceVector: Vector3 = HeightMap._tempVector33;
        Vector3.subtract(ray.origin, vertex1, distanceVector);

        let triangleU = Vector3.dot(distanceVector, directionCrossEdge2);
        triangleU *= inverseDeterminant;

        // Make sure it is inside the triangle.
        if (triangleU < 0 || triangleU > 1) {
            result = Number.NaN;
            return result;
        }

        // Calculate the V parameter of the intersection point.
        const distanceCrossEdge1: Vector3 = HeightMap._tempVector34;
        Vector3.cross(distanceVector, edge1, distanceCrossEdge1);

        let triangleV = Vector3.dot(ray.direction, distanceCrossEdge1);
        triangleV *= inverseDeterminant;

        // Make sure it is inside the triangle.
        if (triangleV < 0 || triangleU + triangleV > 1) {
            result = Number.NaN;
            return result;
        }

        // Compute the distance along the ray to the triangle.
        let rayDistance = Vector3.dot(edge2, distanceCrossEdge1);
        rayDistance *= inverseDeterminant;

        // Is the triangle behind the ray origin?
        if (rayDistance < 0) {
            result = Number.NaN;
            return result;
        }

        result = rayDistance;
        return result;
    }

    private static _getPosition(ray: Ray, vertices: Vector3[][][], indexes: Uint16Array[][]): number {
        let closestIntersection = Number.MAX_VALUE;
        for (let i = 0; i < vertices.length; i++) {
            for (let j = 0; j < vertices[i].length; j++) {
                const subMeshVertices = vertices[i][j];
                const subMeshIndexes = indexes[i][j];

                for (let k = 0; k < subMeshIndexes.length; k += 3) {
                    const vertex1: Vector3 = subMeshVertices[subMeshIndexes[k]];
                    const vertex2: Vector3 = subMeshVertices[subMeshIndexes[k + 1]];
                    const vertex3: Vector3 = subMeshVertices[subMeshIndexes[k + 2]];

                    const intersection = HeightMap.rayIntersectsTriangle(ray, vertex1, vertex2, vertex3);

                    if (!isNaN(intersection) && intersection < closestIntersection) {
                        closestIntersection = intersection;
                    }
                }
            }
        }

        return closestIntersection;
    }

    /**
     * 从网格精灵生成高度图。
     * @param meshes 网格。
     * @param width  高度图宽度。
     * @param height 高度图高度。
     */
    public static creatFromMesh(meshes: ModelMesh[][], width: number, height: number): HeightMap {
        const vertices: Vector3[][][] = []
        const indexes: Uint16Array[][] = []
        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let minZ: number = Number.MAX_VALUE;
        let maxX: number = -Number.MAX_VALUE;
        let maxY: number = -Number.MAX_VALUE;
        let maxZ: number = -Number.MAX_VALUE;

        for (let i = 0; i < meshes.length; i++) {
            vertices[i] = []
            indexes[i] = []
            for (let j = 0; j < meshes[i].length; j++) {
                const mesh = meshes[i][j];
                vertices[i][j] = mesh.getPositions()
                indexes[i][j] = mesh.getIndices()

                const boundingBox = mesh.bounds;
                minX = Math.min(minX, boundingBox.min.x);
                minY = Math.min(minY, boundingBox.min.y);
                minZ = Math.min(minZ, boundingBox.min.z);
                maxX = Math.max(maxX, boundingBox.max.x);
                maxY = Math.max(maxY, boundingBox.max.y);
                maxZ = Math.max(maxZ, boundingBox.max.z);
            }
        }
        const heightMap: HeightMap = new HeightMap(width, height, minX, minY, minZ, maxX, maxY, maxZ);

        const widthSize: number = maxX - minX;
        const heightSize: number = maxZ - minZ;
        const cellWidth: number = heightMap._outCellSize.x = widthSize / (width - 1);
        const cellHeight: number = heightMap._outCellSize.y = heightSize / (height - 1);

        const ray: Ray = HeightMap._tempRay;
        const rayDirE = ray.direction
        rayDirE.x = 0;
        rayDirE.y = -1;
        rayDirE.z = 0;

        const heightOffset: number = 0.1;//OriginalY
        const rayY: number = maxY + heightOffset;
        ray.origin.y = rayY;

        for (let h = 0; h < height; h++) {
            const posZ: number = minZ + h * cellHeight;
            heightMap._data[h] = [];
            for (let w = 0; w < width; w++) {
                const posX: number = minX + w * cellWidth;
                const rayOriE = ray.origin;
                rayOriE.x = posX;
                rayOriE.z = posZ;

                const closestIntersection: number = HeightMap._getPosition(ray, vertices, indexes);
                heightMap._data[h][w] = (closestIntersection === Number.MAX_VALUE) ? NaN : rayY - closestIntersection;
            }
        }

        return heightMap;
    }

    //高度图数据
    private readonly _data: number[][];
    //网格spacing
    private readonly _outCellSize: Vector2 = new Vector2();
    //boundingbox
    private readonly minX: number = Number.MAX_VALUE;
    private readonly minY: number = Number.MAX_VALUE;
    private readonly minZ: number = Number.MAX_VALUE;
    private readonly maxX: number = -Number.MAX_VALUE;
    private readonly maxY: number = -Number.MAX_VALUE;
    private readonly maxZ: number = -Number.MAX_VALUE;

    //高度图横向数据量（int）
    private readonly _w: number;
    //高度图纵向数据量 (int)
    private readonly _h: number;

    /**
     * 获取宽度。
     * @return value 宽度。
     */
    public get width(): number {
        return this._w;
    }

    /**
     * 获取高度。
     * @return value 高度。
     */
    public get height(): number {
        return this._h;
    }

    /**
     * 最大高度。
     * @return value 最大高度。
     */
    public get maxHeight(): number {
        return this.maxY;
    }

    /**
     * 最大高度。
     * @return value 最大高度。
     */
    public get minHeight(): number {
        return this.minY;
    }

    /**
     * 创建一个 <code>HeightMap</code> 实例。
     */
    constructor(width: number, height: number,
                minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
        this._data = [];
        this._w = width;
        this._h = height;

        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;

        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
    }

    /**
     * 获取高度。
     */
    public getHeight(x: number, z: number): number {
        const row = Math.floor((x - this.minX) / this._outCellSize.x);
        const col = Math.floor((z - this.minZ) / this._outCellSize.y);

        let center: number;
        if (this._inBounds(row, col)) {
            center = this._data[row][col];
        } else {
            center = NaN;
        }

        let left: number;
        if (this._inBounds(row - 1, col)) {
            left = this._data[row - 1][col];
        } else {
            left = NaN;
        }

        let right: number;
        if (this._inBounds(row + 1, col)) {
            right = this._data[row + 1][col];
        } else {
            right = NaN;
        }

        let up: number;
        if (this._inBounds(row, col + 1)) {
            up = this._data[row][col + 1];
        } else {
            up = NaN;
        }

        let down: number;
        if (this._inBounds(row, col - 1)) {
            down = this._data[row][col - 1];
        } else {
            down = NaN;
        }

        return (center + left + right + up + down) * 0.2;
    }

    private _inBounds(row: number, col: number): Boolean {
        return row >= 0 && row < this._h && col >= 0 && col < this._w;
    }
}
