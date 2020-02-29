module.exports = (sequelize, DataTypes) => {
    const FriendReq = sequelize.define('FriendReq', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            sender: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: true,
                    notEmpty: true
                }
            },
            receiver: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: true,
                    notEmpty: true
                }
            },
            isConfirmed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }
    );

    FriendReq.associate = (models) => {
        models['FriendReq'].belongsTo(models['User']);
    };

    return FriendReq;
};
