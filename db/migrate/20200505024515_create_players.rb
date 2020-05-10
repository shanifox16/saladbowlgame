class CreatePlayers < ActiveRecord::Migration[5.2]
  def change
    create_table :players do |t|
      t.string :name, null: false
      t.belongs_to :game
      t.string :team, null: false
      t.boolean :is_current_player, null: false, default: false
      t.timestamps
    end
  end
end
