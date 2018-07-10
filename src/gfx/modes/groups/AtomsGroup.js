

import ChemGroup from './ChemGroup';

class AtomsGroup extends ChemGroup {
  constructor(geoParams, selection, colorer, mode, transforms, polyComplexity, material) {
    super(geoParams, selection, colorer, mode, transforms, polyComplexity, material);
  }

  raycast(raycaster, intersects) {
    const atoms = this._selection.atoms;
    const inters = [];
    this._mesh.raycast(raycaster, inters);
    const atomsIdc = this._chunksIdc;
    // process inters array - arr object references
    for (let i = 0, n = inters.length; i < n; ++i) {
      if (!inters[i].hasOwnProperty('chunkIdx')) {
        continue;
      }
      const atomIdx = atomsIdc[inters[i].chunkIdx];
      if (atomIdx < atoms.length) {
        inters[i].atom = atoms[atomIdx];
        intersects.push(inters[i]);
      }
    }
  }

  _calcChunksList(mask) {
    const chunksList = [];
    const atoms = this._selection.atoms;
    const atomsIdc = this._chunksIdc;
    for (let i = 0, n = atomsIdc.length; i < n; ++i) {
      const atom = atoms[atomsIdc[i]];
      if ((atom._mask & mask) !== 0) {
        chunksList.push(i);
      }
    }
    return chunksList;
  }
}

export default AtomsGroup;
