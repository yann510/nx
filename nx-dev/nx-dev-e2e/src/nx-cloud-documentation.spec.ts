import { assertTextOnPage } from './helpers';
import { test, expect } from '@playwright/test';

const pages: Array<{ title: string; path: string }> = [
  {
    title: 'Continuous Integration with Nx',
    path: '/nx-cloud/intro/ci-with-nx',
  },
  {
    title: 'Recording Non-Nx Commands',
    path: '/nx-cloud/recipes/other/record-commands',
  },
  {
    title: 'Enable GitHub PR Integration',
    path: '/nx-cloud/recipes/source-control-integration/github',
  },
  {
    title: 'Connecting Nx Cloud to your existing Google identity provider',
    path: '/nx-cloud/recipes/security/google-auth',
  },
  {
    title: 'Access Tokens',
    path: '/nx-cloud/recipes/security/access-tokens',
  },
  {
    title: 'Security Scenarios',
    path: '/nx-cloud/concepts/scenarios',
  },
  {
    title: 'End to End Encryption',
    path: '/nx-cloud/concepts/encryption',
  },
  {
    title: 'Running Nx Cloud Enterprise',
    path: '/nx-cloud/private-cloud/get-started',
  },
  {
    title: 'Auth (Basic)',
    path: '/nx-cloud/private-cloud/auth-single-admin',
  },
  {
    title: 'GitHub Auth',
    path: '/nx-cloud/private-cloud/auth-github',
  },
  {
    title: 'GitLab Auth',
    path: '/nx-cloud/private-cloud/auth-gitlab',
  },
  {
    title: 'Setting up a dedicated NxCloud VM',
    path: '/nx-cloud/private-cloud/ami-setup',
  },
  {
    title: 'BitBucket Auth',
    path: '/nx-cloud/private-cloud/auth-bitbucket',
  },
  {
    title: 'SAML Auth',
    path: '/nx-cloud/private-cloud/auth-saml',
  },
  {
    title: 'Advanced Configuration',
    path: '/nx-cloud/private-cloud/advanced-config',
  },
  {
    title: 'Configuring the Cloud Runner / Nx CLI',
    path: '/nx-cloud/reference/config',
  },
  {
    title: 'Environment Variables',
    path: '/nx-cloud/reference/env-vars',
  },
  {
    title: 'Nx Cloud Server API Reference',
    path: '/nx-cloud/reference/server-api',
  },
  {
    title: 'Enterprise Release Notes',
    path: '/nx-cloud/reference/release-notes',
  },
];

/**
 * Asserting all the additional API references pages are accounted for and accessible.
 * Generation of the pages is manual since we want to make sure the change is intended.
 */
test.describe('nx-dev: Nx Cloud section', () => {
  pages.forEach((page) => assertTextOnPage(page.path, page.title));
});
