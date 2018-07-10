import ChemGroup from './ChemGroup';
import Bond from '../../../chem/Bond';

function getCylinderCount(bondOrder) {
  return bondOrder < 2 ? 1 : bondOrder;
}

class BondsGroup extends ChemGroup {
  constructor(geoParams, selection, colorer, mode, transforms, polyComplexity, material) {
    super(geoParams, selection, colorer, mode, transforms, polyComplexity, material);
    const drawMultiple = mode.drawMultiorderBonds();
    const showAromatic = mode.showAromaticLoops();
    const bondsIdc = selection.chunks;
    const bonds = selection.bonds;
    let bondsCount = 1;
    for (let i = 0, n = bondsIdc.length; i < n; ++i) {
      bondsCount += this.getBondOrder(bonds[bondsIdc[i]], drawMultiple, showAromatic);
    }
    this._geoArgs = [bondsCount, polyComplexity];
  }

  BondsGroup(geoParams, selection, colorer, mode, transforms, polyComplexity, material) {
    const drawMultiple = mode.drawMultiorderBonds();
    const showAromatic = mode.showAromaticLoops();
    const bondsIdc = selection.chunks;
    const bonds = selection.bonds;
    let bondsCount = 1;
    for (let i = 0, n = bondsIdc.length; i < n; ++i) {
      bondsCount += this.getBondOrder(bonds[bondsIdc[i]], drawMultiple, showAromatic);
    }
    this._geoArgs = [bondsCount, polyComplexity];
    ChemGroup.call(this, geoParams, selection, colorer, mode, transforms, polyComplexity, material);
  }

  getBondOrder(bond, drawMultiple, showAromatic) {
    let bondOrder = 1;
    if (drawMultiple && (!showAromatic || bond._type !== Bond.BondType.AROMATIC)) {
      bondOrder = getCylinderCount(bond._order);
    }
    return bondOrder;
  }

  raycast(raycaster, intersects) {
    const bonds = this._selection.bonds;
    const inters = [];
    this._mesh.raycast(raycaster, inters);
    const bondsIdc = this._chunksIdc;
    // process inters array - arr object references
    for (let i = 0, n = inters.length; i < n; ++i) {
      if (!inters[i].hasOwnProperty('chunkIdx')) {
        continue;
      }
      const chunkIdx = inters[i].chunkIdx;
      const bondIdx = bondsIdc[Math.floor(chunkIdx / 2)];
      if (bondIdx < bonds.length) {
        const bond = bonds[bondIdx];
        inters[i].atom = chunkIdx % 2 === 0 ? bond._left : bond._right;
        intersects.push(inters[i]);
      }
    }
  }

  _calcChunksList(mask, innerOnly) {
    const chunksList = [];
    const bonds = this._selection.bonds;
    const chunksToIdx = this._chunksIdc;
    for (let i = 0, n = chunksToIdx.length; i < n; ++i) {
      const bond = bonds[chunksToIdx[i]];
      if ((bond._left._mask & mask) && (!innerOnly || (bond._right._mask & mask))) {
        chunksList.push(2 * i);
      }
      if ((bond._right._mask & mask) && (!innerOnly || (bond._left._mask & mask))) {
        chunksList.push(2 * i + 1);
      }
    }
    return chunksList;
  }
}

export default BondsGroup;
