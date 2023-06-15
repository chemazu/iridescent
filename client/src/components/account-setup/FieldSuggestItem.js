import React from 'react'
import { ListGroupItem } from "reactstrap"

const FieldSuggestItem = ({ suggestion }) => {
    return <>
        <ListGroupItem className="field-suggest-item">
            {
                suggestion.title
            }
        </ListGroupItem>
    </>
}

export default FieldSuggestItem