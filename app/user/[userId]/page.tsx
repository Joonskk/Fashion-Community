type UserPageProps = {
    params: {
        userId: string;
    }
}

const UserPage = ({params} : UserPageProps) => {
    return (
        <div>
            User Page
            {params.userId}
        </div>
    )
}

export default UserPage;