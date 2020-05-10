class CreateGame < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.string :name, null: false
      t.string :url, null: false
      t.integer :round, null: false, default: 0
      t.string :current_team, null: false
      t.boolean :is_active, default: true

      t.timestamps
    end
  end
end
