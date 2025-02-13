import {
  NxJsonConfiguration,
  readJson,
  readProjectConfiguration,
  updateJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { PackageJson } from 'nx/src/utils/package-json';
import { backwardCompatibleVersions } from '../../utils/backward-compatible-versions';
import {
  angularDevkitVersion,
  angularVersion,
  expressVersion,
  typesExpressVersion,
} from '../../utils/versions';
import { generateTestApplication } from '../utils/testing';
import { setupSsr } from './setup-ssr';

describe('setupSSR', () => {
  describe('with application builder', () => {
    it('should create the files correctly for ssr', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(
        readProjectConfiguration(tree, 'app1').targets.build
      ).toMatchSnapshot();
      expect(tree.read('app1/server.ts', 'utf-8')).toMatchSnapshot();
      expect(tree.read('app1/src/main.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "export { AppServerModule } from './app/app.server.module';
        "
      `);
      expect(tree.read('app1/src/main.ts', 'utf-8')).toMatchInlineSnapshot(`
        "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
        import { AppModule } from './app/app.module';

        platformBrowserDynamic()
          .bootstrapModule(AppModule)
          .catch((err) => console.error(err));
        "
      `);
      expect(tree.exists('app1/tsconfig.server.json')).toBe(false);
      expect(readJson(tree, 'app1/tsconfig.app.json').files).toStrictEqual([
        'src/main.ts',
        'src/main.server.ts',
        'server.ts',
      ]);
      expect(tree.read('app1/src/app/app.server.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import { ServerModule } from '@angular/platform-server';

        import { AppModule } from './app.module';
        import { AppComponent } from './app.component';

        @NgModule({
          imports: [AppModule, ServerModule],
          bootstrap: [AppComponent],
        })
        export class AppServerModule {}
        "
      `);
      expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import {
          BrowserModule,
          provideClientHydration,
        } from '@angular/platform-browser';
        import { RouterModule } from '@angular/router';
        import { AppComponent } from './app.component';
        import { appRoutes } from './app.routes';
        import { NxWelcomeComponent } from './nx-welcome.component';

        @NgModule({
          declarations: [AppComponent, NxWelcomeComponent],
          imports: [BrowserModule, RouterModule.forRoot(appRoutes)],
          providers: [provideClientHydration()],
          bootstrap: [AppComponent],
        })
        export class AppModule {}
        "
      `);
      const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
      expect(nxJson.targetDefaults.server).toBeUndefined();
    });

    it('should create the files correctly for ssr when app is standalone', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, { name: 'app1' });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(
        readProjectConfiguration(tree, 'app1').targets.build
      ).toMatchSnapshot();
      expect(tree.read('app1/server.ts', 'utf-8')).toMatchSnapshot();
      expect(tree.read('app1/src/main.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { bootstrapApplication } from '@angular/platform-browser';
        import { AppComponent } from './app/app.component';
        import { config } from './app/app.config.server';

        const bootstrap = () => bootstrapApplication(AppComponent, config);

        export default bootstrap;
        "
      `);
      expect(tree.exists('app1/tsconfig.server.json')).toBe(false);
      expect(readJson(tree, 'app1/tsconfig.app.json').files).toStrictEqual([
        'src/main.ts',
        'src/main.server.ts',
        'server.ts',
      ]);
      expect(tree.read('app1/src/app/app.config.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
        import { provideServerRendering } from '@angular/platform-server';
        import { appConfig } from './app.config';

        const serverConfig: ApplicationConfig = {
          providers: [provideServerRendering()],
        };

        export const config = mergeApplicationConfig(appConfig, serverConfig);
        "
      `);
      const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
      expect(nxJson.targetDefaults.server).toBeUndefined();
    });
  });

  describe('with browser builder', () => {
    it('should create the files correctly for ssr', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
        bundler: 'webpack',
      });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(
        readProjectConfiguration(tree, 'app1').targets.server
      ).toMatchSnapshot();
      expect(tree.read('app1/server.ts', 'utf-8')).toMatchSnapshot();
      expect(tree.read('app1/src/main.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "export { AppServerModule } from './app/app.server.module';
        "
      `);
      expect(tree.read('app1/src/main.ts', 'utf-8')).toMatchInlineSnapshot(`
        "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
        import { AppModule } from './app/app.module';

        platformBrowserDynamic()
          .bootstrapModule(AppModule)
          .catch((err) => console.error(err));
        "
      `);
      expect(tree.read('app1/tsconfig.server.json', 'utf-8'))
        .toMatchInlineSnapshot(`
        "/* To learn more about this file see: https://angular.io/config/tsconfig. */
        {
          "extends": "./tsconfig.app.json",
          "compilerOptions": {
            "outDir": "../../out-tsc/server",
            "target": "es2019",
            "types": ["node"]
          },
          "files": ["src/main.server.ts", "server.ts"]
        }
        "
      `);
      expect(tree.read('app1/src/app/app.server.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import { ServerModule } from '@angular/platform-server';

        import { AppModule } from './app.module';
        import { AppComponent } from './app.component';

        @NgModule({
          imports: [AppModule, ServerModule],
          bootstrap: [AppComponent],
        })
        export class AppServerModule {}
        "
      `);
      expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import {
          BrowserModule,
          provideClientHydration,
        } from '@angular/platform-browser';
        import { RouterModule } from '@angular/router';
        import { AppComponent } from './app.component';
        import { appRoutes } from './app.routes';
        import { NxWelcomeComponent } from './nx-welcome.component';

        @NgModule({
          declarations: [AppComponent, NxWelcomeComponent],
          imports: [BrowserModule, RouterModule.forRoot(appRoutes)],
          providers: [provideClientHydration()],
          bootstrap: [AppComponent],
        })
        export class AppModule {}
        "
      `);
      const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
      expect(nxJson.targetDefaults.server.cache).toBe(true);
    });

    it('should create the files correctly for ssr when app is standalone', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, {
        name: 'app1',
        bundler: 'webpack',
      });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(
        readProjectConfiguration(tree, 'app1').targets.server
      ).toMatchSnapshot();
      expect(tree.read('app1/server.ts', 'utf-8')).toMatchSnapshot();
      expect(tree.read('app1/src/main.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { bootstrapApplication } from '@angular/platform-browser';
        import { AppComponent } from './app/app.component';
        import { config } from './app/app.config.server';

        const bootstrap = () => bootstrapApplication(AppComponent, config);

        export default bootstrap;
        "
      `);
      expect(tree.read('app1/tsconfig.server.json', 'utf-8'))
        .toMatchInlineSnapshot(`
        "/* To learn more about this file see: https://angular.io/config/tsconfig. */
        {
          "extends": "./tsconfig.app.json",
          "compilerOptions": {
            "outDir": "../../out-tsc/server",
            "target": "es2019",
            "types": ["node"]
          },
          "files": ["src/main.server.ts", "server.ts"]
        }
        "
      `);
      expect(tree.read('app1/src/app/app.config.server.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
        import { provideServerRendering } from '@angular/platform-server';
        import { appConfig } from './app.config';

        const serverConfig: ApplicationConfig = {
          providers: [provideServerRendering()],
        };

        export const config = mergeApplicationConfig(appConfig, serverConfig);
        "
      `);
      const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
      expect(nxJson.targetDefaults.server.cache).toEqual(true);
    });

    it('should update build target output path', async () => {
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
        bundler: 'webpack',
      });
      // verify default output path
      expect(
        readProjectConfiguration(tree, 'app1').targets.build.options.outputPath
      ).toBe('dist/app1');

      await setupSsr(tree, { project: 'app1' });

      expect(
        readProjectConfiguration(tree, 'app1').targets.build.options.outputPath
      ).toBe('dist/app1/browser');
    });
  });

  it('should install the correct dependencies', async () => {
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await generateTestApplication(tree, { name: 'app1' });

    await setupSsr(tree, { project: 'app1' });

    const { dependencies, devDependencies } = readJson<PackageJson>(
      tree,
      'package.json'
    );
    expect(dependencies['@angular/platform-server']).toEqual(angularVersion);
    expect(dependencies['@angular/ssr']).toEqual(angularDevkitVersion);
    expect(dependencies['express']).toEqual(expressVersion);
    expect(dependencies['@nguniversal/express-engine']).toBeUndefined();
    expect(devDependencies['@types/express']).toBe(typesExpressVersion);
    expect(devDependencies['@nguniversal/builders']).toBeUndefined();
  });

  it('should add hydration correctly for NgModule apps', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    await generateTestApplication(tree, {
      name: 'app1',
      standalone: false,
    });

    // ACT
    await setupSsr(tree, { project: 'app1', hydration: true });

    // ASSERT
    expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { NgModule } from '@angular/core';
      import {
        BrowserModule,
        provideClientHydration,
      } from '@angular/platform-browser';
      import { RouterModule } from '@angular/router';
      import { AppComponent } from './app.component';
      import { appRoutes } from './app.routes';
      import { NxWelcomeComponent } from './nx-welcome.component';

      @NgModule({
        declarations: [AppComponent, NxWelcomeComponent],
        imports: [BrowserModule, RouterModule.forRoot(appRoutes)],
        providers: [provideClientHydration()],
        bootstrap: [AppComponent],
      })
      export class AppModule {}
      "
    `);
  });

  it('should add hydration correctly to standalone', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    await generateTestApplication(tree, {
      name: 'app1',
    });

    // ACT
    await setupSsr(tree, { project: 'app1', hydration: true });

    // ASSERT
    expect(tree.read('app1/src/app/app.config.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { ApplicationConfig } from '@angular/core';
      import { provideRouter } from '@angular/router';
      import { appRoutes } from './app.routes';
      import { provideClientHydration } from '@angular/platform-browser';

      export const appConfig: ApplicationConfig = {
        providers: [provideClientHydration(), provideRouter(appRoutes)],
      };
      "
    `);

    expect(tree.read('app1/src/app/app.config.server.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
      import { provideServerRendering } from '@angular/platform-server';
      import { appConfig } from './app.config';

      const serverConfig: ApplicationConfig = {
        providers: [provideServerRendering()],
      };

      export const config = mergeApplicationConfig(appConfig, serverConfig);
      "
    `);
  });

  it('should set "initialNavigation: enabledBlocking" in "RouterModule.forRoot" options when hydration=false', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await generateTestApplication(tree, {
      name: 'app1',
      standalone: false,
    });

    await setupSsr(tree, { project: 'app1', hydration: false });

    expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { NgModule } from '@angular/core';
      import { BrowserModule } from '@angular/platform-browser';
      import { RouterModule } from '@angular/router';
      import { AppComponent } from './app.component';
      import { appRoutes } from './app.routes';
      import { NxWelcomeComponent } from './nx-welcome.component';

      @NgModule({
        declarations: [AppComponent, NxWelcomeComponent],
        imports: [
          BrowserModule,
          RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
        ],
        providers: [],
        bootstrap: [AppComponent],
      })
      export class AppModule {}
      "
    `);
  });

  it('should set "withEnabledBlockingInitialNavigation()" in "provideRouter" features when hydration=false', async () => {
    const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await generateTestApplication(tree, { name: 'app1' });

    await setupSsr(tree, { project: 'app1', hydration: false });

    expect(tree.read('app1/src/app/app.config.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { ApplicationConfig } from '@angular/core';
      import {
        provideRouter,
        withEnabledBlockingInitialNavigation,
      } from '@angular/router';
      import { appRoutes } from './app.routes';

      export const appConfig: ApplicationConfig = {
        providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation())],
      };
      "
    `);
  });

  describe('compat', () => {
    it('should install the correct versions when using older versions of Angular', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });

      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: {
          '@angular/core': '15.2.0',
        },
      }));

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      const pkgJson = readJson(tree, 'package.json');
      expect(pkgJson.dependencies['@angular/ssr']).toBeUndefined();
      expect(pkgJson.dependencies['@angular/platform-server']).toEqual(
        backwardCompatibleVersions.angularV15.angularVersion
      );
      expect(pkgJson.dependencies['@nguniversal/express-engine']).toEqual(
        backwardCompatibleVersions.angularV15.ngUniversalVersion
      );
      expect(pkgJson.devDependencies['@nguniversal/builders']).toEqual(
        backwardCompatibleVersions.angularV15.ngUniversalVersion
      );
    });

    it('should add "withServerTransition" call to app module for angular versions lower than 16', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: { ...json.dependencies, '@angular/core': '^15.2.0' },
      }));

      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import { BrowserModule } from '@angular/platform-browser';
        import { RouterModule } from '@angular/router';
        import { AppComponent } from './app.component';
        import { appRoutes } from './app.routes';
        import { NxWelcomeComponent } from './nx-welcome.component';

        @NgModule({
          declarations: [AppComponent, NxWelcomeComponent],
          imports: [
            BrowserModule.withServerTransition({ appId: 'serverApp' }),
            RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
          ],
          providers: [],
          bootstrap: [AppComponent],
        })
        export class AppModule {}
        "
      `);
    });

    it('should set "initialNavigation: enabledBlocking" in "RouterModule.forRoot" options', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: { ...json.dependencies, '@angular/core': '^15.2.0' },
      }));

      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(tree.read('app1/src/app/app.module.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { NgModule } from '@angular/core';
        import { BrowserModule } from '@angular/platform-browser';
        import { RouterModule } from '@angular/router';
        import { AppComponent } from './app.component';
        import { appRoutes } from './app.routes';
        import { NxWelcomeComponent } from './nx-welcome.component';

        @NgModule({
          declarations: [AppComponent, NxWelcomeComponent],
          imports: [
            BrowserModule.withServerTransition({ appId: 'serverApp' }),
            RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
          ],
          providers: [],
          bootstrap: [AppComponent],
        })
        export class AppModule {}
        "
      `);
    });

    it('should set "withEnabledBlockingInitialNavigation()" in "provideRouter" features', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: { ...json.dependencies, '@angular/core': '^15.2.0' },
      }));

      await generateTestApplication(tree, { name: 'app1' });

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(tree.read('app1/src/app/app.config.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { ApplicationConfig } from '@angular/platform-browser';
        import {
          provideRouter,
          withEnabledBlockingInitialNavigation,
        } from '@angular/router';
        import { appRoutes } from './app.routes';

        export const appConfig: ApplicationConfig = {
          providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation())],
        };
        "
      `);
    });

    it('should wrap bootstrap call for Angular versions lower than 15.2', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: { '@angular/core': '15.1.0' },
      }));

      // ACT
      await setupSsr(tree, { project: 'app1' });

      // ASSERT
      expect(tree.read('app1/src/main.ts', 'utf-8')).toMatchInlineSnapshot(`
              "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
              import { AppModule } from './app/app.module';

              function bootstrap() {
                platformBrowserDynamic()
                  .bootstrapModule(AppModule)
                  .catch((err) => console.error(err));
              }

              if (document.readyState !== 'loading') {
                bootstrap();
              } else {
                document.addEventListener('DOMContentLoaded', bootstrap);
              }
              "
          `);
    });

    it('should generate a correct server.ts', async () => {
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: {
          '@angular/core': '15.2.0',
        },
      }));
      await generateTestApplication(tree, {
        name: 'app1',
        standalone: false,
      });

      await setupSsr(tree, { project: 'app1' });

      expect(tree.read('app1/server.ts', 'utf-8')).toMatchSnapshot();
    });

    it('should not set up hydration by default', async () => {
      const tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
      updateJson(tree, 'package.json', (json) => ({
        ...json,
        dependencies: {
          '@angular/core': '15.2.0',
        },
      }));
      await generateTestApplication(tree, { name: 'app1' });

      await setupSsr(tree, { project: 'app1' });

      expect(tree.read('app1/src/app/app.config.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import { ApplicationConfig } from '@angular/platform-browser';
        import {
          provideRouter,
          withEnabledBlockingInitialNavigation,
        } from '@angular/router';
        import { appRoutes } from './app.routes';

        export const appConfig: ApplicationConfig = {
          providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation())],
        };
        "
      `);
    });
  });
});
