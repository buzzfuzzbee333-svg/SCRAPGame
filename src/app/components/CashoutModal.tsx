import React from 'react';

interface Props {
  waveCleared: number;
  unsecuredScrap: number;
  onCashOut: () => void;
  onContinue: () => void;
}

export default function CashoutModal({ waveCleared, unsecuredScrap, onCashOut, onContinue }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal cashout-modal">
        <div className="modal-title">WAVE {waveCleared} CLEARED</div>
        <div className="cashout-scrap">
          UNSECURED SCRAP: <span className="scrap-color">{unsecuredScrap}</span>
        </div>

        <div className="cashout-options">
          <div className="cashout-option">
            <button className="btn btn-success cashout-btn" onClick={onCashOut}>
              CASH OUT
            </button>
            <div className="cashout-detail">Bank 100% &#8594; {unsecuredScrap} scrap secured</div>
          </div>

          <div className="cashout-option">
            <button className="btn btn-danger cashout-btn" onClick={onContinue}>
              CONTINUE &#8594;
            </button>
            <div className="cashout-detail">Risk it · Next wave awaits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
