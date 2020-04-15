import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Unit | Component | hbs test', function(hooks) {
  setupRenderingTest(hooks);

  test('env helper work well', async function(assert) {
    await render(hbs`{{env 'Name'}}`);
    assert.equal(this.element.textContent.trim(), 'foo');
  });

  test('APP_* env work well', async function(assert) {
    await render(hbs`{{env 'APP_BRAND'}}`);
    assert.equal(this.element.textContent.trim(), 'cfx');
  });


  test('if statement work well', async function(assert) {
    await render(hbs`{{if (env 'CFX') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'bar');
    await render(hbs`{{if (env 'TFX') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'baz');
  });

  test('if block statement work well', async function(assert) {
    await render(hbs`{{#if (env 'CFX')}}bar{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'bar');

    await render(hbs`{{#if (env 'TFX')}}bar{{/if}}`);
    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`{{#if (env 'CFX')}}bar {{else}}baz{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'bar');

    await render(hbs`{{#if (env 'TFX')}}bar {{else}}baz{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'baz');
  });

  test('unless statement work well', async function(assert) {
    await render(hbs`{{unless (env 'CFX') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'baz');

    await render(hbs`{{unless (env 'TFX') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'bar');
  });


  test('unless block statement work well', async function(assert) {
    await render(hbs`{{#unless (env 'CFX')}}bar{{/unless}}`);
    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`{{#unless (env 'TFX')}}bar{{/unless}}`);
    assert.equal(this.element.textContent.trim(), 'bar');

    await render(hbs`{{#unless (env 'CFX')}}bar {{else}}baz{{/unless}}`);
    assert.equal(this.element.textContent.trim(), 'baz');

    await render(hbs`{{#unless (env 'TFX')}}bar {{else}}baz{{/unless}}`);
    assert.equal(this.element.textContent.trim(), 'bar');
  });



  test('if statement with string literal value work well', async function(assert) {
    await render(hbs`{{if (env 'Name' 'foo') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'bar');

    await render(hbs`{{#if (env 'Name' 'foo') }}bar{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'bar');

    await render(hbs`{{#if (env 'Name' 'xxxx') }}bar {{else}}baz{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'baz');
  });

  test('unless statement with string literal value work well', async function(assert) {
    await render(hbs`{{unless (env 'Name' 'foo') 'bar' 'baz'}}`);
    assert.equal(this.element.textContent.trim(), 'baz');

    await render(hbs`{{#unless (env 'Name' 'foo') }}bar{{/unless}}`);
    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`{{#unless (env 'Name' 'xxxx') }}bar {{else}}baz{{/unless}}`);
    assert.equal(this.element.textContent.trim(), 'bar');
  });


  test('statement in deep work well', async function(assert) {
    await render(hbs`<div>{{env 'Name'}}</div>`);
    assert.equal(this.element.innerHTML.trim(), '<div>foo</div>');

    await render(hbs`<div>{{if (env 'CFX') 'bar' 'baz'}}</div>`);
    assert.equal(this.element.innerHTML.trim(), '<div>bar</div>');
  });


  test('nested statement work well', async function(assert) {
    await render(hbs`{{#if (env 'CFX')}}
      {{if (env 'TFX') 'bar' 'baz'}}
    {{/if}}`);
    assert.equal(this.element.textContent.trim(), 'baz');

  });



  test('end test work well', async function(assert) {
    await render(hbs`{{#if (env 'CFX')}}cfx{{/if}}|{{#unless (env 'TFX')}}tfx{{/unless}}`);
    assert.equal(this.element.textContent.trim(), 'cfx|tfx');

    await render(hbs`{{#if (env 'CFX')}}cfx{{/if}}{{#if (env 'TFX')}}tfx{{/if}}`);
    assert.equal(this.element.textContent.trim(), 'cfx');
  });




});
