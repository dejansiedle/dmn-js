import commandStackModule from 'diagram-js/lib/command';
import idChangeBehaviorModule
  from '../../../../../src/features/modeling/behavior/IdChangeBehavior';

import UpdatePropertiesHandler
  from '../../../../../lib/features/modeling/cmd/UpdatePropertiesHandler';

import diagramXML from './id-change-behavior.dmn';

import Viewer from '../../../../../lib/base/viewer/Viewer';

import EditingManager from 'src/base/EditingManager';

/* global sinon */

const config = {
  renderer: {
    container: document.createElement('div')
  }
};

class TestViewer extends Viewer {
  constructor(options) {
    super({
      modules: [
        {
          config: [ 'value', config ]
        },
        commandStackModule,
        {
          __init__: [ 'idChangeBehavior' ],
          idChangeBehavior: [ 'type', idChangeBehaviorModule ]
        }
      ].concat(options.additionalModules)
    });
  }

  attachTo() {}

  on() {}

  open(element, done) {
    this._element = element;

    done();
  }
}

const DECISION_TABLE_VIEW_PROVIDER = {
  id: 'decisionTable',
  opens: 'dmn:Decision',
  constructor: TestViewer
};

class TestEditingManager extends EditingManager {

  constructor(viewProviders=[ DECISION_TABLE_VIEW_PROVIDER ], options={}) {
    super(options);

    this._viewProviders = viewProviders;
  }

  _getViewProviders() {
    return this._viewProviders;
  }

}


describe('IdChangeBehavior', function() {

  var manager, commandStack, element, spy = sinon.spy();

  beforeEach(function(done) {

    // given
    manager = new TestEditingManager();

    manager.importXML(diagramXML, function(err) {
      const viewer = manager._viewers.decisionTable;

      element = viewer._element;

      commandStack = viewer.get('commandStack');

      commandStack.registerHandler('updateProperties', UpdatePropertiesHandler);

      const changeSupport = viewer.get('changeSupport');

      // listen for changes using ID before change
      changeSupport.onElementsChanged(element.id, spy);

      done();
    });

  });


  it('should update change support ID on ID change', function() {

    // when
    commandStack.execute('updateProperties', {
      element,
      properties: {
        id: 'bar'
      }
    });

    // then
    // expect spy called regardless of changed ID
    expect(spy).to.have.been.called;
  });

});