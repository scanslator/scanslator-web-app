import React from "react";
import "./Spinner.css";
import anya from "/anya-loading.gif";

type Props = {
  isLoading?: boolean;
};

const Spinner = ({ isLoading = true }: Props) => {
  return (
    <>
      {/* Overlay div to darken the screen */}
      {isLoading && <div className="overlay"></div>}
      
      {/* Spinner */}
      <div id="loading-spinner">
        {isLoading && <img src={anya.src} alt="Loading Spinner" />}
      </div>
    </>
  );
};

export default Spinner;