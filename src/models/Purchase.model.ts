import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

// Modelo de compras con índice en product_id
@Table({
    tableName: 'purchases',
    indexes: [
        {
            fields: ['product_id']
        }
    ]
})
class Purchase extends Model {
    // ID auto-incremental de la compra
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    declare id: number;

    // ID del producto comprado
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare product_id: number;

    // Fecha de la compra (valor por defecto: fecha actual)
    @Default(DataType.NOW) 
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare purchase_date: Date;

    // Dirección de envío del producto
    @Column({
        type: DataType.STRING(255),
        allowNull: false
    })
    declare mailing_address: string;
}

export default Purchase;