class Player < ApplicationRecord
  validates :name, presence: true
  validates :team, presence: true

  belongs_to :game
end
