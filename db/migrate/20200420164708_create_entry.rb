class CreateEntry < ActiveRecord::Migration[5.2]
  def change
    create_table :entries do |t|
      t.string :name, null: false
      t.boolean :round_one_is_complete, null: false, default: false
      t.string :round_one_winner
      t.boolean :round_two_is_complete, null: false, default: false
      t.string :round_two_winner
      t.boolean :round_three_is_complete, null: false, default: false
      t.string :round_three_winner
      t.boolean :is_deleted, null: false, default: false

      t.timestamps
    end

    create_table :rounds do |t|
      t.integer :number, null: false, default: 1

      t.timestamps
    end
  end
end
