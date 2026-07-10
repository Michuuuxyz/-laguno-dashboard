import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // O projeto usa <img> nos mocks do Discord (avatares externos dinâmicos)
      '@next/next/no-img-element': 'off',
      // Regra da era React Compiler — os casos atuais (fetch inicial, image
      // loader, snapshot pós-load) são padrões clássicos; aviso, não erro.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  { ignores: ['node_modules/**', '.next/**'] },
];

export default config;
