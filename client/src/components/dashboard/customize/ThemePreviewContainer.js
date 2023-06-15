import React from 'react'
import { Row } from "reactstrap"

import ThemePreviewItem from "./ThemePreviewItem"

export const ThemeContainer = ({ themePreview, openThemeChangeModal }) => {
    return <>
        <div className="theme-preview-container">
            <Row>
                {
                    themePreview.length === 0 ? <>
                        <p className="text-center lead">No Theme To Display At This Time.</p>
                    </> : <>
                        {
                            themePreview.map((themepreviewItem) => <ThemePreviewItem
                             key={themepreviewItem._id}
                             themepreviewItem={themepreviewItem}
                             openThemeChangeModal={openThemeChangeModal} />)
                        }
                    </>
                }
            </Row>
        </div>
    </>
}

export default ThemeContainer