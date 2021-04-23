import React from "react";
import { Link } from "react-router-dom";
import { NavbarData } from "./NavbarData";
import "./Navbar.css";

class Navbar extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      currentTime: new Date().toLocaleString(),
    };
  }

  componentDidMount() {
    this.interval = setInterval(
     () => this.setState({ currentTime: new Date().toLocaleString() }),
     1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
     <div>
       <div className="navbar">
            <div className="nav-left">
                <h1 id="title" className="title" style={{ width: "90%", marginRight:"auto", marginLeft:"auto"}}>
                    SALTPETER
                </h1>
	            <ul style={{width: "90%", marginRight:"auto", marginLeft:"auto"}}>
                    {NavbarData.map((item, index) => {
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
            <div className="nav-right">
                <p className="date">{this.state.currentTime}</p>
            </div>
        </div>
     </div>
    );
  }
}

export default Navbar;
