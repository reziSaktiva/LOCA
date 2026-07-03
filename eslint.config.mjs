import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Module MVP resmi — lihat docs/04-system-architecture.md §5 dan docs/05-domain-modules.md.
const MODULES = [
  "auth",
  "customer",
  "catalog",
  "inventory",
  "cart",
  "checkout",
  "order",
  "payment",
  "shipping",
  "review",
  "homepage",
];

const MODULE_LAYERS = ["presentation", "application", "domain", "infrastructure"];

/**
 * Import boundary rules — menegakkan docs/04-system-architecture.md §7-8 (Communication
 * Pattern & Dependency Rules) secara otomatis lewat `import/no-restricted-paths`.
 * Plugin `import` sudah terdaftar oleh eslint-config-next, jadi tidak perlu dependency baru.
 */
const moduleBoundaryZones = [
  {
    target: "./src/modules/*/domain/**/*",
    from: [
      "./src/modules/*/presentation/**/*",
      "./src/modules/*/application/**/*",
      "./src/modules/*/infrastructure/**/*",
      "./src/modules/*/public/**/*",
    ],
    message:
      "Domain layer harus pure — tidak boleh depend ke presentation/application/infrastructure/public.",
  },
  {
    target: "./src/modules/*/infrastructure/**/*",
    from: ["./src/modules/*/presentation/**/*", "./src/modules/*/application/**/*"],
    message:
      "Infrastructure tidak boleh depend balik ke presentation/application (dependency inversion).",
  },
  {
    target: "./src/modules/*/application/**/*",
    from: ["./src/modules/*/presentation/**/*"],
    message: "Application tidak boleh depend ke presentation (UI).",
  },
  {
    target: "./src/modules/*/presentation/**/*",
    from: ["./src/modules/*/infrastructure/**/*"],
    message: "Presentation dilarang mengakses infrastructure langsung — wajib lewat application.",
  },
  {
    target: "./src/app/**/*",
    from: MODULES.flatMap((mod) =>
      ["application", "domain", "infrastructure"].map(
        (layer) => `./src/modules/${mod}/${layer}/**/*`,
      ),
    ),
    message:
      "Route/page di src/app hanya boleh memanggil module lewat presentation atau public, tidak boleh langsung ke application/domain/infrastructure.",
  },
  {
    target: "./src/shared/**/*",
    from: ["./src/modules/**/*"],
    message:
      "shared/ tidak boleh depend ke modules/ — dependency wajib satu arah dari modules ke shared.",
  },
  ...MODULES.map((mod) => ({
    target: `./src/modules/${mod}/**/*`,
    from: MODULES.filter((other) => other !== mod).flatMap((other) =>
      MODULE_LAYERS.map((layer) => `./src/modules/${other}/${layer}/**/*`),
    ),
    message: `Module '${mod}' hanya boleh mengakses module lain lewat folder 'public/' miliknya, bukan layer internal.`,
  })),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": ["error", { zones: moduleBoundaryZones }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
