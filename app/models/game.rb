class Game < ApplicationRecord
  validates :name, presence: true
  validates :url, presence: true
  validates :round, presence: true
  validates :current_team, presence: true

  has_many :entries
end
