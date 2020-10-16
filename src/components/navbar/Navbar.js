import React from "react";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "./Navbar.css";

function Navbar() {
  return (
     <>
       <div className="navbar">
          <h1 id="title" className="title" style={{ width: "90%", marginRight:"auto", marginLeft:"auto"}}>
            SALTPETER
          </h1>
	  <ul style={{width: "90%", marginRight:"auto", marginLeft:"auto"}}>
            {SidebarData.map((item, index) => {
              return (
                <p key={index} className={item.cName}>
                  <Link to={item.path}>
                    <span style={{fontFamily:"Trebuchet MS, sans-serif", letterSpacing:"1px", textTransform:"uppercase"}}>{item.title}</span>
                  </Link>
                </p>
              );
            })}
          </ul>
       </div>
     </>
  );
}

export default Navbar;
