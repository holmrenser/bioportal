import React from 'react';

/**
 * [description]
 * @param  {Set} options.selectedGenes      [description]
 * @param  {Boolean} options.selectedAllGenes        [description]
 * @param  {Function} options.toggleSelectAllGenes    [description]
 * @param  {Function} options.openDownloadDialog [description]
 * @return {Function}                            [description]
 */
export const SelectionOptions = ({ selectedGenes , selectedAllGenes, toggleDownloadDialog }) => {
  console.log(selectedGenes , selectedAllGenes, toggleDownloadDialog)
  return (
    Array.from(selectedGenes).length > 0 || selectedAllGenes ?
    <div className="btn-group btn-group-sm" role="group">
      <button type="button" className="btn btn-sm btn-success" onClick={toggleDownloadDialog}>
        <i className="fa fa-download" aria-hidden="true"></i> Download 
      </button>
      <button type="button" className="btn btn-sm btn-outline-warning" data-toggle="modal" data-target="#download-modal">
        <i className="fa fa-external-link" aria-hidden="true"></i> Send 
      </button>
    </div> :
    null
  )
}

export const SelectAll = ({ selectedGenes, selectedAllGenes, toggleSelectAllGenes }) => {
  return (
    Array.from(selectedGenes).length > 0 || selectedAllGenes ?
    <button type="button" className="btn btn-dark btn-sm select-all" onClick={toggleSelectAllGenes}>
      Unselect all <i className="fa fa-check checked" aria-hidden="true"></i>
    </button> : 
    <button type="button" className="btn btn-sm btn-outline-dark select-all" onClick={toggleSelectAllGenes}>
      Select all <i className="fa fa-check unchecked" aria-hidden="true"></i>
    </button>
  )
}

