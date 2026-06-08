export function PageHeader ({title, description, action}){
    return(
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">

            <div>
                <h1 className="ag-page-title mb-1">{title}</h1>

                {description && <p className="text-muted-2 mb-0 small">{description}</p>}
            </div>

            {action && <div className="d-flex align-items-center gap-2"> {action}</div>}

        </div>
    )
}