import europa from '../data/europa.js';
import noordAmerika from '../data/noord-amerika.js';
import zuidAmerika from '../data/zuid-amerika.js';

// Keys are used in the URL hash (#kaart/europa); data comes from tools/extract_map.py.
export const REGIONS = {
  europa: { name: 'Europa', data: europa, flags: ['NL', 'BE', 'FR', 'DE'] },
  'noord-amerika': { name: 'Noord- en Midden-Amerika', data: noordAmerika, flags: ['CA', 'US', 'MX', 'CU'] },
  'zuid-amerika': { name: 'Zuid-Amerika', data: zuidAmerika, flags: ['BR', 'AR', 'CO', 'PE'] },
};
