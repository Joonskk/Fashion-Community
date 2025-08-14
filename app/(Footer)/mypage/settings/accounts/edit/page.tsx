import EditPage from './EditPage'
import { Suspense } from 'react'

const Edit = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditPage />
        </Suspense>
    )
}

export default Edit;