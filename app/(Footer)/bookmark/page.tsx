import BookmarkPage from './BookmarkPage'
import { Suspense } from 'react'

const Bookmark = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <BookmarkPage />
        </Suspense>
    )
}

export default Bookmark;