class CreateGame < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.string :name, null: false
      t.string :url, null: false
      t.integer :round, null: false, default: 0
      t.string :current_team, null: false
      t.boolean :is_active, default: true
      t.integer :seconds_remaining, null: false, default: 59000
      t.boolean :turn_in_progress, default: false

      t.timestamps
    end
  end
end
