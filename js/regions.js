import europa from '../data/europa.js?v=7';
import noordAmerika from '../data/noord-amerika.js?v=7';
import zuidAmerika from '../data/zuid-amerika.js?v=7';
import afrika from '../data/afrika.js?v=7';
import westAzie from '../data/west-azie.js?v=7';
import oostAzie from '../data/oost-azie.js?v=7';

// Keys are used in the URL hash (#kaart/europa); data comes from tools/extract_map.py.
export const REGIONS = {
  europa: { name: 'Europa', data: europa, flags: ['NL', 'BE', 'FR', 'DE'] },
  'noord-amerika': { name: 'Noord- en Midden-Amerika', data: noordAmerika, flags: ['CA', 'US', 'MX', 'CU'] },
  'zuid-amerika': { name: 'Zuid-Amerika', data: zuidAmerika, flags: ['BR', 'AR', 'CO', 'PE'] },
  afrika: { name: 'Afrika', data: afrika, flags: ['ZA', 'EG', 'NG', 'KE'] },
  'west-azie': { name: 'West- en Centraal-Azië', data: westAzie, flags: ['TR', 'SA', 'IR', 'KZ'] },
  'oost-azie': { name: 'Zuid- en Oost-Azië', data: oostAzie, flags: ['CN', 'JP', 'IN', 'KR'] },
};
