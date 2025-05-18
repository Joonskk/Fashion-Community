import PostView from "./PostView";

type PostPageProps = {
    params: {
        postId: string;
    }
}

const Post = async () => {
    return <PostView />;
};

export default Post;