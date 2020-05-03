class Entry < ApplicationRecord
  validates :name, presence: true

  belongs_to :game
end
