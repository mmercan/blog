---
ID: 420
post_title: >
  Angular Unit Test and Code Coverage in
  Sonarqube
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  http://mmercan.azurewebsites.net/2019/08/15/angular-unit-test-and-code-coverage-in-sonarqube/
published: true
post_date: 2019-08-15 06:42:43
---
<!-- wp:paragraph -->
<p>I am trying to get better at testing, on .NET Core I was getting better, but angular projects in SonarQube had always %0 test coverage. even angular has a built-in testing environment, I have never used it before.<br>I use CI-CD everywhere and I want my angular tests to run before the Docker image created. </p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>How Can I configure Angular for Tests</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I can simply run <strong>ng test </strong>to test my angular app, if you are using angular-cli generate (<strong>ng g</strong>) you already have tests for your components services etc... but if you are like me they are probably broken. if you import modules and use them in your components or inject services to services or components it will break your tests.<br>first, start fixing them <br>run <strong>ng test </strong>and you will get error messages</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":556} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Angular-Unit-Test-and-Code-Coverage-in-Sonarqube-1.jpg" alt="" class="wp-image-556"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>before test starts you can see injected items are missing or if your test creates instance manually parameters missing. if you have generic items you can also see those generic items are not reflected on the tests. add them fix them till all clear out and karma starts.<br>Specially Directives can cause a headache to test</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>How can I test Directives</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>We run directives with components and tests should be the same. We need to create a component, add the directive and test the directive in test component<br>first, create a test component by <strong><em>ng g c test-tools/test</em></strong> (you don't have to change anything on this is just a container for directives.<br><br>let's find the directive test file (.directive.spec.ts) or create a new one to test a directive without a test</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"jscript"} -->
<pre class="wp-block-syntaxhighlighter-code">import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TestComponent } from '../test-tools/test/test.component';
import { ToggleFullscreenDirective } from './toggle-fullscreen.directive';

describe('ToggleFullscreenDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture&lt;TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [],
      declarations: [ToggleFullscreenDirective, TestComponent],
    }).overrideComponent(TestComponent, {
      set: {
        template: '&lt;div class="mytestclass" appToggleFullscreen>NoAuth&lt;/div>'
      }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should onclick works', () => {
    const directiveEl = fixture.debugElement.query(By.directive(ToggleFullscreenDirective));
    expect(directiveEl).not.toBeNull();

    const directiveInstance = directiveEl.injector.get(ToggleFullscreenDirective);
    expect(directiveInstance.onClick()).toEqual(true);
  });

});</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>On line 11, Create Test Module by importing every module your directive need. Add services to providers and add component and the directive to declarations.  Override test component and add the directive to the component by overrideComponent (I want to use this component for all directives to test not just this directive keeping the template dynamic will allow me to do that). compileComponents returns a Promise, async waits till it compiles  the component<br><br>should "onclick" works query the fixture to find the directive checks it is injected after it calls onClick function and checks the return value.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":563} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Angular-Unit-Test-and-Code-Coverage-in-Sonarqube-2.jpg" alt="" class="wp-image-563"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Next, read errors on Karma and inject services, or modules if they are missed on tests it may take some times (mine took 3 hours) but you can get the green light in the end.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Open package.json file and add below inside  scripts block <br><strong><em>"test:ci": "ng test --browsers ChromeHeadlessCI --code-coverage true --watch false"</em></strong><br>your package.json should be similar to this:</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"jscript"} -->
<pre class="wp-block-syntaxhighlighter-code">{
  "name": "client-app",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "test:ci": "ng test --browsers ChromeHeadlessCI --code-coverage true --watch false"
  },
  "private": true,
  "dependencies": {
.........</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>As I am planning to run this with my CI, CD pipeline and in a Docker container, I need to run those test headless <strong>--browsers ChromeHeadlessCI</strong> handle that part.<br>As we are running this to collect code coverage for SonarQube <strong>--code-coverage true</strong> self-explanatory. <br>I want to run the test once and collect the result I am not after a file watcher on this -<strong>-watch false</strong><br><br>Next stop <strong>karma.conf.js</strong> you can find it in src folder of your project open it and Add  customLaunchers after the plugins file should be like below</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"jscript"} -->
<pre class="wp-block-syntaxhighlighter-code">module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>before adding SonarQube in to the picture open a PowerShell window in your Project Folder and Call<br><strong><em>npm run test:ci</em></strong></p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":600} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Angular-Unit-Test-and-Code-Coverage-in-Sonarqube-3.jpg" alt="" class="wp-image-600"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>you should also see <strong>coverage </strong>folder in your project's root folder.<br>as the test is running fine we can start the last step getting them into SonarQube<br>first Create <strong>sonar-project.properties</strong> file in the root folder of your angular project, <br>I used SonarCloud and installed an instance of SonarQube this file works fine with both (if you are running your SonarQube Instance, you don't need sonar.organization)</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">sonar.host.url=https://sonarcloud.io
sonar.organization=[put_your_organization_for_sonarcloud_ignore_otherwise]
sonar.login=[put_GeneratedTokens_here (https://docs.sonarqube.org/latest/user-guide/user-token/)] 
sonar.projectKey=[put_your_project_key]
sonar.projectName=[put_your_project_name]
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/assets/**,**/*.spec.ts
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.ts.tslintconfigpath=tslint.json
sonar.typescript.lcov.reportPaths=coverage/lcov.info</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>this file by itself useless we need the sonar-scanner npm package to use this. let's install it now.<br>run  npm install sonar-scanner --save-dev <br><em><strong> </strong></em>npm install sonar-scanner --save-dev<strong> </strong>in the root folder of your angular project. this will install sonar scanner<br>now re-open   package.json file and add  <strong>"sonar": "sonar-scanner", </strong> just after the  test:ci line <br>it should be like <br><br>npm install sonar-scanner --save-dev</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">{
  "name": "client-app",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "sonar": "sonar-scanner",
    "test:ci": "ng test --browsers ChromeHeadlessCI --code-coverage true --watch false"
  },
  "private": true,
  "dependencies": {
.........</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>now you can run <br><strong>npm run test:ci <br>npm run sonar</strong><br>the first step will run the tests and the second line will send the result to SonarQube <br></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Bonus Content: Docker image to run them all (dockerfile below does it all) <br>Repository: <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/mmercan/sentinel/tree/master/Sentinel.UI.HealthMonitoring" target="_blank">https://github.com/mmercan/sentinel/tree/master/Sentinel.UI.HealthMonitoring</a> </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">FROM node:11.0 as test
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update &amp;&amp; apt-get install -y vim &amp;&amp; apt-get -y install sudo
RUN apt-get install -y openjdk-8-jdk
RUN java -version
RUN apt-get install -y --no-install-recommends chromium
ENV CHROME_BIN=chromium
EXPOSE 4300
USER node
RUN mkdir /home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN npm install -g @angular/cli
WORKDIR /home/node/health
COPY . .
USER root

RUN sudo npm install
RUN npm run test:ci; exit 0
RUN npm run sonar
</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":603} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Angular-Unit-Test-and-Code-Coverage-in-Sonarqube-4.jpg" alt="" class="wp-image-603"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Next Step is adding more tests covering more or maybe failing the image build if Quality gate Fails.</p>
<!-- /wp:paragraph -->