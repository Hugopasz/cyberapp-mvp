// Pools de imagens carregadas via Vite (URLs resolvidas em build/dev).
// Cenários 16:9 (~1280x720) e personagens 3:4 (~768x1024), todos em WebP.

const cenarioModules = import.meta.glob('./cenarios/*.webp', { eager: true, import: 'default' });
const personagemModules = import.meta.glob('./personagens/*.webp', { eager: true, import: 'default' });

const toSortedUrls = (modules) =>
  Object.keys(modules)
    .sort()
    .map((k) => modules[k]);

export const CENARIOS_POOL = toSortedUrls(cenarioModules);
export const PERSONAGENS_POOL = toSortedUrls(personagemModules);
