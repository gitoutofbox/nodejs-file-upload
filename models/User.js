module.exports = (sequelize, DataTypes) => {
    const UserSchema = sequelize.define('users', {
        name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        avatar: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        }
    });

    return UserSchema;
}
