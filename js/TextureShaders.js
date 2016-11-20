var NoiseSource = `
    uniform int octaves;
    uniform float lacunarity;
    uniform float gain;

    float permute(float n, float range) { 
        return abs( 1.0 - mod(floor(n * (n * n * 15731.0 + 789221.0) + 1376312589.0), 2147483647.0) / 1073741824.0) * range;
    }

    float permute3(float x, float y, float z) { 
        return permute(permute(permute(x, 256.0) + y, 256.0) + z, 256.0);
    }

    float fade(float t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); 
    }

    float gradient(float h, float x, float y, float z) {
        int idx = int(mod(floor(h), 12.0));
        vec3 vector;
        if(idx == 0) {
            vector = vec3(1, 1, 0);
        } else if(idx == 1) {
            vector = vec3(1, 0, 1);
        } else if(idx == 2) {
            vector = vec3(0, 1, 1);
        } else if(idx == 3) {
            vector = vec3(-1, 1, 0);
        } else if(idx == 4) {
            vector = vec3(-1, 0, 1);
        } else if(idx == 5) {
            vector = vec3(0, -1, 1);
        } else if(idx == 6) {
            vector = vec3(1, -1, 0);
        } else if(idx == 7) {
            vector = vec3(1, 0, -1);
        } else if(idx == 8) {
            vector = vec3(0, 1, -1);
        } else if(idx == 9) {
            vector = vec3(-1, -1, 0);
        } else if(idx == 10) {
            vector = vec3(-1, 0, -1);
        } else {
            vector = vec3(0, -1, -1);
        }
        return dot(vector, vec3(x, y, z));
    }

    float perlin(float x, float y, float z) {
        // reference: http://flafla2.github.io/2014/08/09/perlinnoise.html
        
        float xi = mod(floor(x), 256.0);
        float yi = mod(floor(y), 256.0);
        float zi = mod(floor(z), 256.0);

        float xf = x-floor(x);
        float yf = y-floor(y);
        float zf = z-floor(z);

        float u = fade(xf);
        float v = fade(yf);
        float w = fade(zf);

        float aaa, aba, aab, abb, baa, bba, bab, bbb;
        aaa = permute3(xi, yi, zi);
        aba = permute3(xi, yi + 1.0, zi);
        aab = permute3(xi, yi, zi + 1.0);
        abb = permute3(xi, yi + 1.0, zi + 1.0);
        baa = permute3(xi + 1.0, yi, zi);
        bba = permute3(xi + 1.0, yi + 1.0, zi);
        bab = permute3(xi + 1.0, yi, zi + 1.0);
        bbb = permute3(xi + 1.0, yi + 1.0, zi + 1.0);

        float x1 = mix(gradient(aaa, xf, yf, zf), gradient(baa, xf - 1.0, yf, zf), u);
        float x2 = mix(gradient(aba, xf, yf - 1.0, zf), gradient(bba, xf - 1.0, yf - 1.0, zf), u);
        float y1 = mix(x1, x2, v);

        x1 = mix(gradient(aab, xf, yf, zf - 1.0), gradient(bab, xf - 1.0, yf, zf - 1.0), u);
        x2 = mix(gradient(abb, xf, yf - 1.0, zf - 1.0), gradient(bbb, xf - 1.0, yf - 1.0, zf - 1.0), u);
        float y2 = mix(x1, x2, v);

        return mix(y1, y2, w);
    }

    float fBm(float x, float y, float z) {
        float total = 0.0, frequency = 1.0, amplitude = 1.0, maxValue = 0.0;
        for (int i = 0; i < 4; i ++) {
            total += (perlin(x * frequency, y * frequency, z * frequency) + 1.0) / 2.0 * amplitude;
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        return total / maxValue;
    }

    float turbulence(float x, float y, float z) {
        float total = 0.0, frequency = 1.0, amplitude = 1.0, maxValue = 0.0;
        for (int i = 0; i < 4; i ++) {
            total += abs(perlin(x * frequency, y * frequency, z * frequency)) * amplitude;
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        return total / maxValue;
    }

    float marble(float x, float y, float z) {
        float k1 = 1.0;
        float k2 = 1.0;
        float w = 1.0;
        return (1.0 + sin(k1 * x + turbulence(k2 * x, k2 * y, k2 * z)) / w) / 2.0;
    }

    float wood(float x, float y, float z) {
        float size = 1.0;
        float turbPower = 0.2;
        float ringn = 5.0;

        x = mod(x, size);
        y = mod(y, size);

        float disv = sqrt(x * x + y * y) + turbPower * fBm(x, y, z);
        float sinv = sin(2.0 * ringn * disv * 3.14159) / 2.0;
        return sinv;
    }
`;

var VertexSource = `
    varying vec3 gPosition;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        vec4 temp = modelMatrix * vec4(position, 1);
        gPosition = temp.xyz / temp.w;
    }
`;