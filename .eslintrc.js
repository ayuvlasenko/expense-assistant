const { join } = require("path");

module.exports = {
  "root": true,
  "plugins": [
    "@typescript-eslint",
    "sonarjs",
    "prettier"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:sonarjs/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/member-delimiter-style": "error",
    "@typescript-eslint/member-ordering": "warn",
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    "@typescript-eslint/no-confusing-void-expression": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-return-this-type": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/sort-type-union-intersection-members": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    // "@typescript-eslint/strict-boolean-expressions": ["error", {
    //   "allowString": true,
    //   "allowNumber": true,
    //   "allowNullableObject": true,
    //   "allowNullableBoolean": true,
    //   "allowNullableString": true,
    //   "allowNullableNumber": true,
    //   "allowAny": false,
    //   "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": false
    // }],
    "@typescript-eslint/type-annotation-spacing": "error",
    "quotes": "off",
    "@typescript-eslint/quotes": ["error", "double"],
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"],
    "indent": "off",
    // "@typescript-eslint/indent": [
    //   "error",
    //   4,
    //   {
    //     "SwitchCase": 1,
    //     "ignoredNodes": [
    //       "FunctionExpression > .params[decorators.length > 0]",
    //       "FunctionExpression > .params > :matches(Decorator, :not(:first-child))",
    //       "ClassBody.body > PropertyDefinition[decorators.length > 0] > .key"
    //     ]
    //   }
    // ],
    // "brace-style": ["error", "stroustrup"],
    // "@typescript-eslint/brace-style": ["error", "stroustrup"],
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "always-multiline",
        "enums": "always-multiline",
        "generics": "always-multiline",
        "tuples": "always-multiline"
      }
    ],
    "comma-spacing": "off",
    "@typescript-eslint/comma-spacing": "error",
    "@typescript-eslint/default-param-last": "error",
    "dot-notation": "off",
    "@typescript-eslint/dot-notation": "error",
    "keyword-spacing": "off",
    "@typescript-eslint/keyword-spacing": "error",
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-dupe-class-members": "error",
//    "no-extra-parens": "off",
//    "@typescript-eslint/no-extra-parens": "error",
    "no-invalid-this": "off",
    "@typescript-eslint/no-invalid-this": "error",
    "no-loop-func": "off",
    "@typescript-eslint/no-loop-func": "error",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "no-throw-literal": "off",
    "@typescript-eslint/no-throw-literal": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "error",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",
    "space-infix-ops": "off",
    "@typescript-eslint/space-infix-ops": "error",
    "object-curly-spacing": "off",
    "@typescript-eslint/object-curly-spacing": ["error", "always"],
    "require-await": "off",
    "@typescript-eslint/require-await": "error",
    "space-before-function-paren": "off",
    "@typescript-eslint/space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["warn"],
    "no-promise-executor-return": "error",
    "array-bracket-spacing": ["error", "never"],
    "curly": ["error", "all"],
    "eqeqeq": ["error", "always"],
    "guard-for-in": "error",
    "multiline-comment-style": ["error", "separate-lines"],
    "no-confusing-arrow": "error",
    "no-else-return": "error",
    "no-floating-decimal": "error",
    "no-inline-comments": "error",
    "no-lonely-if": "error",
    "no-mixed-operators": "error",
    "no-multi-assign": "error",
    "no-negated-condition": "error",
    "no-nested-ternary": "error",
    "no-param-reassign": "error",
    "prefer-const": "error",
    "prefer-template": "error",
    "spaced-comment": ["error", "always"],
    "arrow-parens": ["error", "always"],
    "arrow-spacing": "error",
    "block-spacing": "error",
    "computed-property-spacing": ["error", "never"],
    "dot-location": ["error", "property"],
    "eol-last": ["error", "always"],
    "func-call-spacing": ["error", "never"],
    "function-call-argument-newline": ["error", "consistent"],
    // "implicit-arrow-linebreak": ["error", "beside"],
    "key-spacing": "error",
//    "linebreak-style": ["error", "unix"],
    "new-parens": "error",
    // "newline-per-chained-call": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": "error",
    "no-tabs": "error",
    "no-trailing-spaces": "error",
    "no-whitespace-before-property": "error",
    "rest-spread-spacing": "error",
    "semi-spacing": "error",
    "semi-style": "error",
    "space-before-blocks": "error",
    "space-unary-ops": "error",
    "switch-colon-spacing": "error",
    "template-curly-spacing": "error",
    "prettier/prettier": "warn"
  },
  "settings": {
    "node": {
      "tryExtensions": [".js", ".jsx", ".ts", ".tsx", ".json"]
    }
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
    "sourceType": "module"
  },
  "ignorePatterns": ["**/.eslintrc.js", "migration/**"],
  "overrides": [
    {
      "files": [
        "./src/**/*.spec.ts"
      ],
      "plugins": [
        "@typescript-eslint",
        "eslint-plugin-jest",
        "sonarjs"
      ],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jest/recommended",
        "plugin:sonarjs/recommended"
      ],
      "env": {
        "jest/globals": true
      },
      "rules": {
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "sonarjs/no-redundant-jump": "warn",
        "sonarjs/cognitive-complexity": "warn",
        "sonarjs/no-duplicate-string": "warn",
      }
    },
    {
      "files": "./src/**/*.ts",
      "excludedFiles": [
        "./src/**/*.spec.ts"
      ],
      "plugins": [
        "@typescript-eslint",
        "eslint-plugin-node",
        "sonarjs"
      ],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:node/recommended",
        "plugin:sonarjs/recommended"
      ],
      "rules": {
        "node/no-missing-import": "off",
        "node/no-unsupported-features/es-syntax": [
          "error",
          { "ignores": ["modules"] }
        ],
        "node/no-extraneous-import": [
          "error",
          {
            "allowModules": ["express"]
          }
        ],
        "sonarjs/no-redundant-jump": "warn",
        "sonarjs/cognitive-complexity": "warn",
        "sonarjs/no-duplicate-string": "warn",
      }
    }
  ],
  env: {
    node: true,
    jest: true,
  },
}
