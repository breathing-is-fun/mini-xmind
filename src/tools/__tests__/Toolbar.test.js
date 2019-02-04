import React from 'react';
import { mount } from 'enzyme';
const testDist = process.env.LIB_DIR === 'dist';
let Toolbar;
switch (process.env.LIB_DIR) {
  case 'dist':
    Toolbar = require('../../../dist/lib/toolbar').default;
    break;
  case 'lib':
    Toolbar = require('../../../lib/toolbar').default;
    break;
  default:
    Toolbar = require('..').default;
    break;
}
import { tools } from '../../options/tools';
import 'nino-cli/scripts/setup';

describe('Toolbar', () => {
  it('toolbar render correctly', () => {
    const wrapper = mount(<Toolbar />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('.anticon').length).toBe(tools.length);
  });
});
