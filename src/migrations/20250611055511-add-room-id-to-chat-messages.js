'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add room_id column
    await queryInterface.addColumn('chatMessages', 'room_id', {
      type: Sequelize.INTEGER,
      allowNull: true // Nullable for non-room messages
    });

    // Add indexes
    await queryInterface.addIndex('chatMessages', ['room_id']);
    await queryInterface.addIndex('chatMessages', ['sender_id', 'sender_type']);
    await queryInterface.addIndex('chatMessages', ['receiver_id', 'receiver_type']);
  },

  async down(queryInterface) {
    // Remove indexes
    await queryInterface.removeIndex('chatMessages', ['room_id', 'sender_type']);
    await queryInterface.removeIndex('chatMessages', ['receiver_id', 'receiver_type']);
    await queryInterface.removeIndex('chatMessages', ['room_id']);

    // Remove room_id column
    await queryInterface.removeColumn('chatMessages', 'room_id');
  }
};