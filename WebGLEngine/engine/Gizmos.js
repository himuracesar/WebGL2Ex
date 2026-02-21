
class Gizmos {
    constructor() {
        var descriptor = {
            height: 5.0,
            slices: 16,
            stacks: 4
        };

        this.createAxisGeometry();
    }

    createAxisGeometry(segments = 16) {
        const vertices = [];
        const shaftRadius = 0.02;
        const shaftHeight = 0.8;
        const headRadius = 0.08;
        const headHeight = 0.2;

        // --- Generar Cilindro (Shaft) ---
        for (let i = 0; i <= segments; i++) {
            let u = (i / segments) * Math.PI * 2;
            let x = Math.cos(u);
            let z = Math.sin(u);

            // Vértice inferior (y = 0)
            vertices.push(x * shaftRadius, 0, z * shaftRadius);
            // Vértice superior (y = shaftHeight)
            vertices.push(x * shaftRadius, shaftHeight, z * shaftRadius);
        }

        // --- Generar Cono (Head) ---
        for (let i = 0; i <= segments; i++) {
            let u = (i / segments) * Math.PI * 2;
            let x = Math.cos(u);
            let z = Math.sin(u);

            // Base del cono (y = shaftHeight)
            vertices.push(x * headRadius, shaftHeight, z * headRadius);
            // Punta del cono (y = shaftHeight + headHeight)
            vertices.push(0, shaftHeight + headHeight, 0);
        }

        return new Float32Array(vertices);
    }
}