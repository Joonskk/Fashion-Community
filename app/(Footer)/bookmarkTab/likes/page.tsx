import LikesPage from './LikesPage'
import { Suspense } from 'react'

const Likes = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <LikesPage />
        </Suspense>
    )
}

export default Likes;