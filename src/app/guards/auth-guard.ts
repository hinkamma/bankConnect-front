import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  // On récupère le Router pour pouvoir rediriger l'utilisateur si besoin
  const router = inject(Router);

  // On récupère l'ID de la plateforme (browser ou server)
  // Nécessaire car ton app a le SSR activé (server.ts qu'on a vu plus tôt)
  const platformId = inject(PLATFORM_ID);

  // Si on est côté serveur (SSR), localStorage n'existe pas.
  // On laisse donc passer temporairement : la vraie vérification
  // se fera de toute façon côté navigateur juste après.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // On est bien côté navigateur : on peut lire le localStorage
  // Vérifie que 'token' est exactement le nom de la clé que tu utilises au login
  const token = localStorage.getItem('token');

  // Si le token existe, on autorise l'accès à la route
  if (token) {
    return true;
  }

  // Si pas de token : on redirige l'utilisateur vers la page de login...
  router.navigate(['/login']);

  // ...et on bloque l'accès à la route demandée
  return false;
};