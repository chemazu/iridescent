import React from 'react'
import { ListGroup, ListGroupItem } from "reactstrap"
import FieldSuggestItem from "./FieldSuggestItem"

export const FieldSuggestContainer = ({ suggestions }) => {
    return <>
        <ListGroup className="field-suggest shadow">
            {
                suggestions.length === 0 ? <ListGroupItem className="not-found-suggestion">Field not found</ListGroupItem> : <>
                    {
                        suggestions.map((suggestion) => <FieldSuggestItem key={suggestion._id} suggestion={suggestion} />)
                    }
                </>
            }
        </ListGroup>
    </>
}


export default FieldSuggestContainer