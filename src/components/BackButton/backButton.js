import React from "react";
import Button from "components/Button";
import { Link } from "react-router-dom";

const BackButton = (props) => {
    return (
        <Link to={props.link}>
            <Button label="Back" />
        </Link>
    )
}

export default BackButton;
