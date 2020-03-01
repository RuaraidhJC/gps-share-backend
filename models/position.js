module.exports = (sequelize, DataTypes) => {
    const Position = sequelize.define('Position',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            longitude: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            latitude: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT
            },
            rating: {
                type: DataTypes.ENUM(1, 2, 3, 4, 5)
            }
        }
    );

    Position.associate = (models) => {
        models['Position'].belongsTo(models['User']);
    };

    return Position;
};
