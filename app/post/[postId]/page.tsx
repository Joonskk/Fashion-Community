import PostView from "./PostView";

type PostPageProps = {
    params: {
        postId: string;
    }
}

const Post = ({ params }: PostPageProps) => {
    return <PostView postId={params.postId} />;
};

export default Post;