const selectPostAuthorUserIdByComment=(postId:string)=>`
SELECT fake_posts.fk_user_id from posts_comments RIGHT JOIN
    fake_posts ON posts_comments.fk_post_id=fake_posts.pk_id
        WHERE posts_comments.fk_post_id='${postId}'
            LIMIT 1
`;

export default selectPostAuthorUserIdByComment