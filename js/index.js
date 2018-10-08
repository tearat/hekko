var app = new Vue({
    el: "#app",
    data: {
        debug: false,
        busy: false,
        location: 0,
        database: [],
        thread: {},
        comments: [],
        new_comment_title: "",
        new_comment_body: "",
        new_thread_title: "",
        new_thread_body: "",
    },
    methods: {
        find_by_id: function(id) {
            for(i=0; i<this.database.length; i++) {
                if ( this.database[i].id == id ) {
                    return i;
                }
            }
        },
        load_database: function() {
            var result = [];
            $.ajax({
                url: "/data/database.json",
                cache: false,
                async: false,
            }).done(function (data) {
                result = data;
            });
            
            for(i=0; i<result.length; i++) {
//                result[i].comments = this.count_comments(result[i].id);
                result[i].comments = 333;
            }
            
            this.database = result;
        },
        load_thread(id) {
            this.location = id;
            var target = this.find_by_id(id);
            this.thread = this.database[target];
            this.load_comments(id);
        },
        load_comments(id) {
            this.comments = [];
            if (id != 0) {
                for(i=0; i<this.database.length; i++) {
                    if ( this.database[i].parent == id ) {
                        this.comments.push(this.database[i]);
                    }
                }
            }
        },
        count_comments(id) {
            var count = 0;
            for(i=0; i<this.database.length; i++) {
                if(this.database[i].parent == id) {
                    count++;
                }
            }
            return count;  
        },
        add_comment(parent) {
            this.busy = true;
            if(this.new_comment_body != "") {
                if (this.new_comment_title == "") {
                    this.new_comment_title = "Анонимус";
                }
                this.database.push({
                    id: this.database[this.database.length-1].id+1,
                    title: this.new_comment_title,
                    body: this.new_comment_body,
                    parent: parent
                });
                this.new_comment_title = "";
                this.new_comment_body = "";
                this.save_database();
                this.load_comments(parent);
            }
            this.busy = false;
        },
        add_thread() {
            this.busy = true;
            var new_id;
            if(this.database.length == 0) {
                new_id = 1;
            } else {
                new_id = this.database[this.database.length-1].id+1;
            }
            if( (this.new_thread_title != "") && (this.new_thread_body != "") ) {
                this.database.push({
                    id: new_id,
                    title: this.new_thread_title,
                    body: this.new_thread_body,
                    parent: 0
                });
                this.new_thread_title = "";
                this.new_thread_body = "";
                this.save_database();
                this.load_database();
            }
            this.busy = false;
        },
        delete_comment(comment_id, thread_id) {
            this.busy = true;
            var target = this.find_by_id(comment_id);
            this.database.splice(target, 1);
            this.save_database();
            this.load_comments(thread_id);
            this.busy = false;
        },
        delete_thread(thread_id) {
            this.busy = true;
            
            
            for(i=this.database.length-1; i>=0; i--) {
                if(this.database[i].parent == thread_id) {
                    var target = this.find_by_id(this.database[i].id);
                    this.database.splice(target, 1);
                }
            }
            
            var target = this.find_by_id(thread_id);
            this.database.splice(target, 1);
            
            this.save_database();
            this.load_database();
            this.busy = false;
        },
        save_database() {
            this.busy = true;
            var that = this;
            $.ajax({
                type: "POST",
                url: "/data/saver.php",
                cache: false,
                async: false,
                data: {
                    action: 'save',
                    stream: JSON.stringify(that.database)
                }
            });
            this.busy = false;
        }
    },
    watch: {
//        database: function() {
//            this.save_database();
//            this.load_database();
//        }
    },
    mounted: function() {
        this.load_database();
        var that = this;
        setInterval(function(){ 
            if (!that.busy) {
                that.load_database();
            }
            if (that.location > 0) {
                that.load_comments(that.location);
            }
        }, 500);
    }
});

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
        app.location = 0;
    }
};